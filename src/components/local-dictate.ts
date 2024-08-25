import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentProgressRing, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentProgressRing());

@customElement('local-dictate')
export class LocalDictate extends LitElement {

    @state() started: boolean = false;

    wakeLock: any | null = null;
    mediaRecorder: MediaRecorder | null = null;

    static styles = [
        css`
            :host {
                display: block;
            }

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

            #stop::part(content) {
                display: flex;
                gap: 8px;
                align-items: center;
                justify-content: space-between;
                font-size: 12px;
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

                fluent-button img {
                    filter: invert(0);
                }
            }

            @media(max-width: 600px) and (prefers-color-scheme: light) {
                fluent-button img {
                    filter: invert(1);
                }
            }

            @media(prefers-color-scheme: dark) {
                fluent-button img {
                    filter: invert(1);
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
        `
    ];

    public async dictate() {
        if ("setAppBadge" in navigator) {
            await (navigator as any).setAppBadge();
        }

        // record audio using mediaRecorder api
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);

        let audioChunks: Array<Blob> = [];

        this.mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = async () => {
            console.log("stopped recording");
            const { transcribeAudioFile } = await import("web-ai-toolkit");

            const audioBlob = new Blob(audioChunks);
            const text = await transcribeAudioFile(audioBlob);

            console.log('text', text);

            this.dispatchEvent(new CustomEvent('got-text', {
                detail: {
                    text
                }
            }));
        }

        this.started = true;

        this.wakeLock = await this.requestWakeLock();

        this.mediaRecorder.start();

        let event = new CustomEvent("start-text", {
            detail: {
                message: "start",
            },
        });
        this.dispatchEvent(event);
    }

    public stop() {
        console.log("stopping recording");
        this.mediaRecorder?.stop();
        this.started = false;

        if (this.wakeLock !== null) {
            this.wakeLock.release();
        }

        let event = new CustomEvent("stop-text", {
            detail: {
                message: "stop",
            },
        });
        this.dispatchEvent(event);
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
          </fluent-button>
          <fluent-tooltip anchor="dictate"><span>Dictate</span></fluent-tooltip>
          `
                : html`
            <fluent-button id="stop" @click="${() => this.stop()}">
              <fluent-progress-ring></fluent-progress-ring>
              Click when done to stop
            </fluent-button>
          `}
        `;
    }
}
