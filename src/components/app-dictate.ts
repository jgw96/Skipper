import { LitElement, css, html } from "lit";

import { customElement, state } from "lit/decorators.js";

import { fluentProgressRing, provideFluentDesignSystem } from '@fluentui/web-components';

import 'speech-to-text-toolkit';

provideFluentDesignSystem().register(fluentProgressRing());

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

            fluent-tooltip {
                --neutral-layer-card-container: #8c6ee0;
                --fill-color: var(--theme-color);
                color: white;
                border: none;
                display: block;

                animation: quickup 0.3s ease;
              }

              fluent-tooltip span {
                color: white;
              }

            #stop::part(control) {
              color: white;
            }

            md-filled-tonal-button, md-filled-button, md-outlined-button{
                font-family: system-ui;
            }

            fluent-button {
                animation: quickSlideFromLeft 0.3s;
            }

            fluent-button::part(control) {
                background: transparent;
            }

            fluent-button img {
                margin-top: 6px;
                width: 24px;
                height: 24px;
            }

            fluent-progress-ring {
                height: 20px;
                width: 20px;
                --progress-ring-foreground: #0078d4;
            }

            @media(max-width: 600px) {
                :host {
                    position: fixed;
                    left: 8px;
                    right: 8px;
                    bottom: 122px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                #dictate::part(control), #stop::part(control) {
                    height: 64px;
                    width: 64px;
                    background: #8c6ee0;
                    border-radius: 50%;
                }

                #dictate img {
                    width: 32px;
                    height: 32px;
                }

                #stop fluent-progress-ring::part(indeterminate-indicator-1) {
                    stroke: white;
                }

                #dictate::part(control) {
                    box-shadow: 0px 2px 20px #00000070;
                }
            }

            @media(prefers-color-scheme: light) {
                #stop::part(control) {
                    color: black;
                }

                fluent-tooltip {
                    background: white;
                    --fill-color: white;
                }

                fluent-tooltip span {
                    color: black;
                }
            }

            @keyframes quickSlideFromLeft {
                from {
                    transform: translateY(30%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
    `;
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        const speechToText: any = this.shadowRoot?.querySelector("speech-to-text");
        speechToText.addEventListener('recognized', (e: any) => {
            console.log('recognized', e.detail.message);

            let event = new CustomEvent("got-text", {
                detail: {
                    messageData: e.detail.message,
                },
            });
            this.dispatchEvent(event);
        });
    }

    public async dictate() {
        if ("setAppBadge" in navigator) {
            await (navigator as any).setAppBadge();
        }

        this.wakeLock = await this.requestWakeLock();

        const speechToText: any = this.shadowRoot?.querySelector("speech-to-text");
        speechToText?.startSpeechToText();

        this.started = true;

        let event = new CustomEvent("start-text", {
            detail: {
                message: "start",
            },
        });
        this.dispatchEvent(event);
    }

    async stop() {
        const speechToText: any = this.shadowRoot?.querySelector("speech-to-text");
        speechToText?.stopSpeechToText();

        this.started = false;

        if ("setAppBadge" in navigator) {
            await (navigator as any).clearAppBadge();
        }

        if (this.wakeLock) {
            this.wakeLock.release();
        }
    }

    setUpListeners() {

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
         <speech-to-text localOrCloud="local">
            ${this.started === false
                ? html`<fluent-button id="dictate" @click="${() => this.dictate()}">
                    <img src="/assets/mic-outline.svg" />
            </fluent-button>
            <fluent-tooltip anchor="dictate"><span>Dictate</span></fluent-tooltip>
            `
                : html`
                <fluent-button id="stop" @click="${() => this.stop()}">
                <fluent-progress-ring></fluent-progress-ring>
                </fluent-button>
            `}
          </speech-to-text>
    `;
    }
}