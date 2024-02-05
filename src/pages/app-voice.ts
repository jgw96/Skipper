import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';
import { doTextToSpeech, requestGPT } from '../services/ai';
import { SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import { saveConversation } from '../services/storage';

import { fluentButton, fluentTextField, fluentOption, fluentListbox, fluentCard, provideFluentDesignSystem } from '@fluentui/web-components';

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

    @state() status: string = "Start a conversation with Assist by tapping the button below";

    @state() context: any;

    sdk: any;
    audioConfig: any;
    speechConfig: any;
    recog: any;

    stream: any;
    analyser: any;

    previewAnimation: any;


    static styles = [
        styles,
        css`
    #welcomeBar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .stop-button::part(control) {
        background: red;
        color: white;
    }

    #welcomeCard,
    #infoCard {
      padding: 18px;
      padding-top: 0px;
    }

    #toolbar {
      position: fixed;
      left: 10vw;
      right: 10vw;
      bottom: 20px;
      display: flex;
      align-items: center;

      flex-direction: column;
    justify-content: space-between;
    }

    #status {
      font-weight: bold;
      font-size: 12px;
    }

    main {
      z-index: 9;
      position: relative;
    }

    canvas {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100vh;
      width: 100vw;
      z-index: -1;
    }

    #status {
      text-align: center;
    }

    sl-card::part(footer) {
      display: flex;
      justify-content: flex-end;
    }

    #start-button img {
      height: 20px;
      width: 20px;
    }

    fluent-button {
        --accent-fill-rest: #5e11fd;
        --accent-stroke-control-rest: #5e11fd;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      background: #80808059;
      padding: 8px;
      border-radius: 8px;
      margin: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    ul li {
      background: rgba(128, 128, 128, 0.35);
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 8px;
      padding-bottom: 8px;
      border-radius: 6px;
    }

    ul li h4 {
      margin: 0;
      padding: 0;
    }

    @media(min-width: 750px) {
      sl-card {
        width: 70vw;
      }
    }


    @media (horizontal-viewport-segments: 2) {
      #welcomeBar {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }

      #welcomeCard {
        margin-right: 64px;
      }
    }
  `];

    async firstUpdated() {
        // this method is a lifecycle even in lit
        // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
        console.log('This is your home page');

        this.sdk = await import("microsoft-cognitiveservices-speech-sdk");
        console.log("this.sdk", this.sdk);

        this.audioConfig = this.sdk.AudioConfig.fromDefaultMicrophoneInput();
        this.speechConfig = this.sdk.SpeechConfig.fromSubscription('a3484733425e4929ae1da1f90a5f0a16', 'eastus');

        this.speechConfig!.speechRecognitionLanguage = 'en-US';
        this.speechConfig!.enableDictation();

        (this.recog as SpeechRecognizer) = new this.sdk.SpeechRecognizer(this.speechConfig, this.audioConfig);

        await this.setUpListeners();

        await this.startVisual();

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
                console.log(`CANCELED: Reason=${e.reason}`);

                if (e.reason == this.sdk.CancellationReason.Error) {
                    console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                    console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                    console.log("CANCELED: Did you set the speech resource key and region values?");
                }

                await this.recog.stopContinuousRecognitionAsync();

                // try to restart
                await this.recog.startContinuousRecognitionAsync();
            };

            this.recog.sessionStopped = (s?: any, e?: any) => {
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

        let canvas = null;

        if ('OffscreenCanvas' in window) {
            // @ts-ignore
            canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
        }
        else {
            canvas = document.createElement('canvas');
        }


        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (!this.context) {
            this.context = canvas.getContext('2d');
        }

        // @ts-ignore
        this.context?.clearRect(0, 0, canvas.width, canvas.height);

        this.draw(data, this.context, canvas, onscreenCanvas);
    }

    // @ts-ignore
    draw(data: Uint8Array, context: any, canvas: HTMLCanvasElement | OffscreenCanvas, onScreenCanvas: ImageBitmapRenderingContext | HTMLCanvasElement | null | undefined) {
        this.analyser?.getByteFrequencyData(data);

        context.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#232734db' : '#edebe9';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);

        let barWidth = (window.innerWidth / data.length) * 4.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
            barHeight = data[i];

            context.fillStyle = 'rgb(' + (barHeight + 100) + ',107,210)';
            context.fillRect(x, window.innerHeight - barHeight * 4, barWidth, barHeight * 4);

            x += barWidth + 1;
        }

        if ('OffscreenCanvas' in window) {
            // @ts-ignore
            let bitmapOne = (canvas as OffscreenCanvas).transferToImageBitmap();
            (onScreenCanvas as ImageBitmapRenderingContext).transferFromImageBitmap(bitmapOne);
        }

        window.requestAnimationFrame(() => this.draw(data, context, canvas, onScreenCanvas));
    }

    share() {
        if ((navigator as any).share) {
            (navigator as any).share({
                title: 'PWABuilder pwa-starter',
                text: 'Check out the PWABuilder pwa-starter!',
                url: 'https://github.com/pwa-builder/pwa-starter',
            });
        }
    }

    async send(content: string) {
        await this.recog.stopContinuousRecognitionAsync();

        if (this.status !== "Responding..." && this.status !== "Thinking...") {
            this.status = "Thinking...";

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
                        content: inputValue
                    }
                ];

                const data = await requestGPT(inputValue as string)
                console.log("home data", data)

                this.previousMessages = [
                    ...this.previousMessages,
                    {
                        role: "system",
                        content: data.choices[0].message.content
                    }
                ]

                this.status = "Responding...";

                await doTextToSpeech(data.choices[0].message.content);

                if (this.previousMessages.length > 3) {
                    console.log("look here", this.convoName, this.previousMessages)
                    await saveConversation(this.convoName as string, this.previousMessages);
                }

                await this.recog.startContinuousRecognitionAsync();

                this.status = "Listening...";
                this.loading = true;

                return data;

            }
        }
    }

    async stop() {
        await this.recog.stopContinuousRecognitionAsync();
        this.loading = false;

        this.status = "Stopped";
    }

    render() {
        return html`
      <!-- <app-header></app-header> -->

      <canvas></canvas>

      <main>
        <div id="messages">
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
        </div>

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
