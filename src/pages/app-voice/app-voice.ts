import { LitElement, html, unsafeCSS } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../../styles/shared-styles';
import { requestGPT } from '../../services/ai';
import { SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import { saveConversation } from '../../services/storage';

import { fluentButton, fluentTextField, fluentOption, fluentListbox, fluentCard, provideFluentDesignSystem } from '@fluentui/web-components';
import { getOpenAIKey } from '../../services/keys';

import cssModule from './app-voice.css?inline';

import "../../components/screen-sharing";

provideFluentDesignSystem().register(fluentButton(), fluentTextField(), fluentOption(), fluentListbox(), fluentCard());

@customElement('app-voice')
export class AppVoice extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() previousMessages: any[] = [];
  @state() convoName: string | undefined;
  @state() loading = false;

  @state() lines: string[] = [];
  @state() finalizedLines: string[] = [];
  @state() transcript = "";
  @state() focusedLine = "";
  @state() keyPoints: string[] = [];

  @state() status: string = "";

  @state() context: any;

  @state() currentPhoto: string | null = null;
  @state() inPhotoConvo = false;

  @state() sharingScreen = false;

  sdk: any;
  audioConfig: any;
  speechConfig: any;
  recog: any;

  stream: any;
  analyser: any;

  previewAnimation: any;

  currentAudioEl: HTMLAudioElement | null = null;
  wakeLock: any;


  static styles = [
    styles,
    unsafeCSS(cssModule),
  ];

  async firstUpdated() {

    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');

    const { checkPlusSub } = await import('../../services/settings');
    const proFlag = await checkPlusSub();
    console.log("proFlag", proFlag);
    if (!proFlag) {
      const dialog: any = this.shadowRoot?.querySelector('.upgrade-dialog');
      console.log("dialog", dialog);
      dialog.addEventListener('sl-request-close', (event: any) => {
        event.preventDefault();
      });

      await dialog.show();
    }

    this.sdk = await import("microsoft-cognitiveservices-speech-sdk");
    console.log("this.sdk", this.sdk);

    this.audioConfig = this.sdk.AudioConfig.fromDefaultMicrophoneInput();
    this.speechConfig = this.sdk.SpeechConfig.fromSubscription(import.meta.env.VITE_SPEECH_SUB, 'centralus');

    this.speechConfig!.speechRecognitionLanguage = 'en-US';
    this.speechConfig!.enableDictation();

    (this.recog as SpeechRecognizer) = new this.sdk.SpeechRecognizer(this.speechConfig, this.audioConfig);

    await this.setUpListeners();

    await this.startVisual();

    this.addImageWithDragDrop();

    this.wakeLock = this.requestWakeLock();

  }

  requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      let wakeLock: any;

      try {
        wakeLock = await (navigator as any).wakeLock.request();

        wakeLock.addEventListener("release", () => {
          console.log("Screen Wake Lock released:", wakeLock.released);
        });

        return wakeLock;
      } catch (err) {
        console.error(`${(err as any).name}, ${(err as any).message}`);
      }
    }
  };

  addImageWithDragDrop() {
    const dropElement: HTMLElement | null | undefined = this.shadowRoot?.querySelector('main');
    console.log('dropElement', dropElement)

    dropElement?.addEventListener('dragover', (event) => {
      console.log("dragover")
      event.preventDefault();
      dropElement.classList.add("drag-over");
    });

    dropElement?.addEventListener('dragleave', (event) => {
      event.preventDefault();
      dropElement.classList.remove("drag-over");
    });

    dropElement?.addEventListener('drop', async (event) => {
      event.preventDefault();
      dropElement.classList.remove("drag-over");

      const dt = event.dataTransfer;
      const files = dt!.files;

      console.log("files", files[0])

      if (files.length > 0 && files[0].type.includes("image")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64data = e.target?.result;
          this.addImageToConvo(base64data as string);

          await this.start();
        }

        reader.readAsDataURL(files[0]);
      }
      // else if ((files.length > 0 && files[0].type.includes("audio"))) {
      //   // const reader = new FileReader();
      //   // reader.onload = (e) => {
      //   //   const base64data = e.target?.result;
      //   //   const text = await doSpeechToText(new Blob([files[0]]));
      //   // }

      //   // reader.readAsDataURL(files[0]);
      //   const text = await doSpeechToText(files[0]);
      //   const input: any = this.shadowRoot?.querySelector('fluent-text-area');
      //   input.value = text;
      // }
    });

  }

  async addImageToConvo(base64data: string) {
    this.currentPhoto = base64data;
    this.inPhotoConvo = true;
  }

  async setUpListeners() {
    this.lines = [];
    this.finalizedLines = [];
    this.keyPoints = [];

    if (this.recog) {
      this.recog.recognizing = (s?: any, e?: any) => {
        this.status = "Listening...";

        console.log("s", s);
        console.log("s.results", e.result);


        this.transcript = e.result.text;

        if (this.lines.length && this.lines[this.lines.length - 1] !== this.finalizedLines[this.finalizedLines.length - 1]) {
          // remove the last line from this.lines
          this.lines = this.lines.slice(0, this.lines.length - 1);
        }

        this.lines = [...this.lines, e.result.text];

        this.requestUpdate();

      };

      let recogCounter = 0;

      this.recog.recognized = async (s?: any, e?: any) => {
        console.log(s);
        console.log('recognized', e.result.text);

        recogCounter++;

        if (e.result.text && e.result.text.length > 0) {
          this.finalizedLines = [...this.finalizedLines, e.result.text];
          this.lines = [...this.finalizedLines];

          this.focusedLine = e.result.text;
          console.log('this.focusedLine', this.focusedLine);

          if (this.focusedLine && this.focusedLine.length > 0) {
            const data = await this.send(this.focusedLine as string)
            console.log("home data", data)
          }

          this.requestUpdate();
        }
      }

      this.recog.canceled = async (s?: any, e?: any) => {
        console.log(`CANCELED: Reason=${e.reason}, ${s}`);

        if (e.reason == this.sdk.CancellationReason.Error) {
          console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
          console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
          console.log("CANCELED: Did you set the speech resource key and region values?");
        }

        await this.recog.stopContinuousRecognitionAsync();

        // try to restart
        // await this.recog.startContinuousRecognitionAsync();
      };

      this.recog.sessionStopped = () => {
        console.log("\n    Session stopped event.");
        this.recog.stopContinuousRecognitionAsync();
      };
    }
  }

  async start() {
    this.recog.startContinuousRecognitionAsync();

    this.loading = true;

    this.status = "Listening...";
  }

  private async startVisual() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });
    console.log("here 1");
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(this.stream);

    this.analyser = audioContext.createAnalyser();

    source.connect(this.analyser);

    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.runVisual(dataArray);
  }

  runVisual(data: Uint8Array) {
    let onscreenCanvas = null;

    if ('OffscreenCanvas' in window) {
      onscreenCanvas = this.shadowRoot?.querySelector('canvas')?.getContext('bitmaprenderer');
    }
    else {
      onscreenCanvas = this.shadowRoot?.querySelector('canvas');
    }

    let canvas: HTMLCanvasElement | null = null;

    if ('OffscreenCanvas' in window) {
      // @ts-ignore
      canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    }
    else {
      canvas = document.createElement('canvas');
    }


    canvas!.width = window.innerWidth;
    canvas!.height = window.innerHeight;

    if (!this.context) {
      this.context = canvas!.getContext('2d');
    }

    // handle resizing
    window.addEventListener('resize', () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;

      // this.draw(data, this.context, canvas, onscreenCanvas);
    });

    // @ts-ignore
    this.context?.clearRect(0, 0, canvas.width, canvas.height);

    this.draw(data, this.context, canvas!, onscreenCanvas);
  }

  // @ts-ignore
  draw(data: Uint8Array, context: any, canvas: HTMLCanvasElement | OffscreenCanvas, onScreenCanvas: ImageBitmapRenderingContext | HTMLCanvasElement | null | undefined) {
    this.analyser?.getByteFrequencyData(data);

    // draw a circle that expands and contracts based on the audio data
    let radius = 100 + data[30] / 5;
    const randomShadeOfPurple = 'rgb(' + (radius) + ',107,210)';
    context.beginPath();
    context.arc(window.innerWidth / 2, window.innerHeight / 2, radius, 0, 2 * Math.PI, false);
    context.fillStyle = randomShadeOfPurple;
    context.fill();

    if ('OffscreenCanvas' in window) {
      // @ts-ignore
      let bitmapOne = (canvas as OffscreenCanvas).transferToImageBitmap();
      (onScreenCanvas as ImageBitmapRenderingContext).transferFromImageBitmap(bitmapOne);
    }

    window.requestAnimationFrame(() => this.draw(data, context, canvas, onScreenCanvas));
  }

  async send(content: string) {
    await this.recog.stopContinuousRecognitionAsync();

    if (this.status !== "Responding..." && this.status !== "Thinking...") {
      this.status = "Thinking...";

      if (this.sharingScreen === true) {
        const screen: any = this.shadowRoot?.querySelector('screen-sharing');
        if (screen) {
          screen.takeScreenshotFromStreamCont();
        }

        this.sharingScreen = false;
      }

      const inputValue = content;

      if (this.previousMessages.length === 0) {
        // first coupe of words of inputValue
        const convoName = inputValue?.split(" ").slice(0, 8).join(" ");
        console.log('convoName', convoName)
        this.convoName = convoName;
      }

      if (inputValue && inputValue.length > 0) {

        this.previousMessages = [
          ...this.previousMessages,
          {
            role: "user",
            content: inputValue,
            image: this.currentPhoto
          }
        ];

        let data: any;
        if (this.inPhotoConvo === true || (this.currentPhoto && this.currentPhoto !== "")) {
          const { makeAIRequestWithImage } = await import('../../services/ai');
          data = await makeAIRequestWithImage(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          if (this.currentPhoto) {
            this.currentPhoto = null;
            this.inPhotoConvo = true;
          }
        }
        else {
          data = await requestGPT(inputValue as string)
        }

        this.previousMessages = [
          ...this.previousMessages,
          {
            role: "assistant",
            content: data.choices[0].message.content
          }
        ]

        this.status = "Responding...";

        const GPTKey = await getOpenAIKey();

        // onst speakerEl = await doTextToSpeech(data.choices[0].message.content);
        const script = data.choices[0].message.content;
        const response = await fetch(`https://gpt-server-two-qsqckaz7va-uc.a.run.app/texttospeech?text=${script}&key=${GPTKey}`, {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            previousMessages: this.previousMessages,
            key: GPTKey
          })
        });
        const speakerData = await response.blob();

        const audio = new Audio(URL.createObjectURL(speakerData));
        this.currentAudioEl = audio;

        audio.onended = async () => {
          await this.recog.startContinuousRecognitionAsync();

          this.status = "Listening...";
          this.loading = true;

          return data;
        }

        audio.play();

        if (this.previousMessages.length > 1) {
          console.log("look here", this.convoName, this.previousMessages)
          await saveConversation(this.convoName as string, this.previousMessages);
        }

      }
    }
  }

  async stop() {
    await this.recog.stopContinuousRecognitionAsync();
    this.loading = false;
    this.recog = null;

    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
    }

    this.status = "";
  }

  openCamera() {
    const input = document.createElement('input');
    input.type = "file";
    input.name = "image";
    input.accept = "image/*";
    input.capture = "environment";

    input.click();

    // add iamge from input
    input.addEventListener("change", async (event: any) => {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        this.addImageToConvo(base64data as string);
      }

      reader.readAsDataURL(file);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();

    if (this.wakeLock) {
      this.wakeLock.release();
    }
  }

  render() {
    return html`
      <!-- <app-header></app-header> -->

      <sl-dialog class="upgrade-dialog" label="Upgrade to Skipper Pro" modal no-header>
        <h2>Upgrade to Skipper Pro</h2>
        <p>This feature is only available to Skipper Pro users. Upgrade now to get access to this feature and much more!</p>

        <fluent-anchor id="upgrade-link" href="/pro" appearance="accent">Upgrade Now</fluent-anchor>
        <fluent-anchor id="cancel-link" href="/" appearance="light">Go Back Home</fluent-anchor>
      </sl-dialog>

      <div id="extra-tools">
        <screen-sharing @streamStarted="${this.sharingScreen = true}" @screenshotTaken="${($event: any) => this.addImageToConvo($event.detail.src)}"></screen-sharing>
        <fluent-button id="open-camera-button" @click="${() => this.openCamera()}" apperance="accent" size="small">
            <img src="/assets/camera-outline.svg" alt="camera icon">
          </fluent-button>
      </div>

      ${this.inPhotoConvo === true && this.currentPhoto ? html`
        <img src="${this.currentPhoto}" id="current-photo" alt="Current Photo" />
      ` : null
      }

      <canvas></canvas>

      <main>
        <!-- <div id="messages">
          ${this.previousMessages && this.previousMessages.length > 0 ? html`
          <ul>
          ${this.previousMessages.map((message: any) => {
        return html`
                <li class="message ${message.role}">
                  <h4>${message.role}</h4>
                  <p>${message.content}</p>
                </li>
              `;
      })
        }
          </ul>` : null}
        </div> -->

        <div id="toolbar">
          <p id="status">${this.status}</p>

          ${this.loading === false ? html`<fluent-button appearance="accent" id="start-button" @click="${() => this.start()}">
            Start Conversation
        </fluent-button>` : html`<fluent-button class="stop-button" id="start-button" @click="${() => this.stop()}">
        <img slot="prefix" src="/assets/mic-outline.svg" alt="Start" />

            Stop Conversation
        </fluent-button>`}
        </div>
      </main>
    `;
  }
}
