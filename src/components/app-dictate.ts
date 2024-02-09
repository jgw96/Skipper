import { LitElement, css, html } from "lit";

import { customElement, state } from "lit/decorators.js";

@customElement("app-dictate")
export class AppDictate extends LitElement {
    @state() recog: any | null = null;
    @state() lines: string[] = [];
    @state() thinkingLines: string[] = [];
    @state() started: boolean = false;
    @state() wakeLock: any | null = null;

    static get styles() {
        return css`
            #dictate {
                background: var(--app-color-primary);
            }

            #stop {
                background: red;
            }

            md-filled-tonal-button, md-filled-button, md-outlined-button{
                font-family: system-ui;
            }

            fluent-button::part(control) {
                background: transparent;
            }

            fluent-button img {
                margin-top: 6px;
                width: 20px;
                height: 20px;
            }
    `;
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        // speech to text
        (window as any).requestIdleCallback(
            async () => {
                const sdk = await import("microsoft-cognitiveservices-speech-sdk");

                const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
                const speechConfig = sdk.SpeechConfig.fromSubscription(
                    "b5b594f480a64837a37d7c3f24da9c38",
                    "westus"
                );

                speechConfig.speechRecognitionLanguage = "en-us";

                this.recog = new sdk.SpeechRecognizer(
                    speechConfig,
                    audioConfig
                );

                console.log(this.recog);

                this.setUpListeners();
            },
            {
                timeout: 2000,
            }
        );
    }

    async dictate() {
        if ("setAppBadge" in navigator) {
            await (navigator as any).setAppBadge();
        }

        this.recog.startContinuousRecognitionAsync();

        this.started = true;

        this.wakeLock = await this.requestWakeLock();

        let event = new CustomEvent("start-text", {
            detail: {
                message: "start",
            },
        });
        this.dispatchEvent(event);
    }

    async stop() {
        this.recog.stopContinuousRecognitionAsync();

        this.started = false;

        if ("setAppBadge" in navigator) {
            await (navigator as any).clearAppBadge();
        }

        if (this.wakeLock) {
            this.wakeLock.release();
        }

        // let event = new CustomEvent("got-text", {
        //     detail: {
        //         messageData: this.lines,
        //     },
        // });
        // this.dispatchEvent(event);
    }

    setUpListeners() {
        this.lines = [];

        if (this.recog) {
            this.recog.recognizing = (s?: any, e?: any) => {
                console.log(s);
                console.log(e.result);

                if (e.result.text && e.result.text.length > 0) {
                    this.thinkingLines.push(e.result.text);
                }

                let event = new CustomEvent("thinking-text", {
                    detail: {
                        messageData: this.thinkingLines.join(" "),
                    },
                });
                this.dispatchEvent(event);

                // this.transcript = e.result.text;
            };

            this.recog.recognized = (s?: any, e?: any) => {
                console.log(s);
                console.log("recognized", e.result.text);

                if (e.result.text && e.result.text.length > 0) {
                    this.lines.push(e.result.text);

                    let event = new CustomEvent("got-text", {
                        detail: {
                            messageData: this.lines,
                        },
                    });
                    this.dispatchEvent(event);
                }
            };
        }
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

    render() {
        return html`
      ${this.started === false
                ? html`<fluent-button id="dictate" @click="${() => this.dictate()}">
                <img src="/assets/mic-outline.svg" />
          </fluent-button>`
                : html`
            <fluent-button @click="${() => this.stop()}">
              <img src="/assets/mic-off-outline.svg" />
            </fluent-button>
          `}
    `;
    }
}