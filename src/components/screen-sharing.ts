import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'
import { startScreenSharing, stopScreenSharing } from '../services/utils';

@customElement('screen-sharing')
export class ScreenSharing extends LitElement {
    @state() streaming = false;
    @state() stream: MediaStream | null = null;
    @state() displayCheck = false;

    static styles = [
        css`
            :host {
                display: block;
            }

            #video-wrapper {
                width: 268px;
                position: absolute;
                bottom: 16vh;
                padding: 8px;
                border-radius: 8px;
                backdrop-filter: blur(64px);
                background: rgb(36 36 36);

                display: flex;
                flex-direction: column;
                gap: 10px;

                animation: quickSlideInFromBottom 0.3s;
            }

            video {
                width: 100%;
                border-radius: 6px;
            }

            fluent-button, fluent-text-area, fluent-listbox, fluent-card, fluent-tooltip, fluent-search {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;

                --neutral-fill-input-rest: var(--theme-color);
                --neutral-fill-input-hover: var(--theme-color);
                --neutral-fill-input-active: var(--theme-color);
                --neutral-fill-input-focus: var(--theme-color);
              }

              fluent-button img {
                margin-top: 6px;
                width: 24px;
                height: 24px;
            }

              #start-button::part(control) {
                background: #ffffff0f;
              }

              @media(prefers-color-scheme: light) {
                #video-wrapper {
                    background: rgb(218 215 215);
                }
              }

              @media(prefers-color-scheme: dark) {
                fluent-button img {
                    filter: invert(1);
                  }

                  #start-button::part(control) {
                    background: transparent;
                  }
            }

              @keyframes quickSlideInFromBottom {
                from {
                  transform: translateY(40%);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
        `
    ];

    firstUpdated() {
        // check for getDisplayMedia
        this.displayCheck = 'getDisplayMedia' in navigator.mediaDevices;
    }

    async doScreenShare() {
        const stream = await startScreenSharing();
        this.streaming = true;
        this.stream = (stream as MediaStream);
    }

    async takeScreenshotFromStream() {
        const video = this.shadowRoot?.querySelector('video');
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const goodSrc = canvas.toDataURL('image/png');

        const img = document.createElement('img');
        img.src = goodSrc;

        console.log(img);

        // fire custom event with goodSrc
        this.dispatchEvent(new CustomEvent('screenshotTaken', {
            detail: {
                src: goodSrc
            }
        }));

        this.stream = null;
        this.streaming = false;

        await stopScreenSharing();

    }

    render() {
        return html`
        ${this.displayCheck ? html`
        ${this.stream ? html`
              <div id="video-wrapper">
                <video .srcObject="${this.stream}" autoplay></video>

                <fluent-button appearance="accent" @click="${() => this.takeScreenshotFromStream()}">Take Screenshot</fluent-button>
                </div>
            ` : null
                }

          <div>
            <fluent-button id="start-button" @click="${() => this.doScreenShare()}">
              <img src="/assets/scan-outline.svg">
            </fluent-button>
          </div>
        ` : null}
        `;
    }
}
