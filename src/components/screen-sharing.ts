import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'

@customElement('screen-sharing')
export class ScreenSharing extends LitElement {
  @state() streaming = false;
  @state() stream: MediaStream | null = null;
  @state() displayCheck = false;

  // @property({ type: Boolean }) show = true;

  static styles = [
    css`
            :host {
                display: block;
            }

            #video-wrapper {
                width: 268px;
                position: absolute;
                bottom: 100%;
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
                pointer-events: none;
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
    this.displayCheck = 'getDisplayMedia' in navigator.mediaDevices && navigator.userAgent.toLowerCase().includes("android") === false;
  }

  async doScreenShare() {
    const { startScreenSharing } = await import('../services/utils');
    const stream = await startScreenSharing();
    this.streaming = true;
    this.stream = (stream as MediaStream);

    this.dispatchEvent(new CustomEvent('streamStarted', {
      detail: {
        stream: this.stream
      }
    }));

    await this.updateComplete;

    const videoEl = this.shadowRoot?.querySelector('video');
    videoEl!.onloadedmetadata = () => {
      this.setupDraggable();
    }
  }

  setupDraggable() {
    const dragItem = this.shadowRoot?.querySelector('#video-wrapper');
    const container = this.shadowRoot;

    let active = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;

    container!.addEventListener("touchstart", dragStart, false);
    container!.addEventListener("touchend", dragEnd, false);
    container!.addEventListener("touchmove", drag, false);

    container!.addEventListener("mousedown", dragStart, false);
    container!.addEventListener("mouseup", dragEnd, false);
    container!.addEventListener("mousemove", drag, false);

    function dragStart(e: any) {
      console.log("e.target", e.target, dragItem);
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd() {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e: any) {
      if (active) {

        e.preventDefault();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem!);
      }
    }

    function setTranslate(xPos: number, yPos: number, el: any) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
  }

  public async takeScreenshotFromStream() {
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

    this.doStopScreen();

  }

  public async takeScreenshotFromStreamCont() {
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

  }

  async doStopScreen() {
    this.stream = null;
    this.streaming = false;

    const { stopScreenSharing } = await import('../services/utils');
    stopScreenSharing();
  }

  render() {
    return html`
        ${this.displayCheck ? html`
        ${this.stream ? html`
              <div id="video-wrapper">
                <video .srcObject="${this.stream}" autoplay></video>

                <fluent-button appearance="accent" @click="${() => this.doStopScreen()}">Stop Sharing Screen</fluent-button>
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
