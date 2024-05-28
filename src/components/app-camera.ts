import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js'

@customElement('app-camera')
export class AppCamera extends LitElement {
    @state() stream: MediaStream | null = null;
    @state() imageCapture: any | null = null;

    ctx: CanvasRenderingContext2D | null = null;
    canvas: HTMLCanvasElement | null = null;
    video: HTMLVideoElement | null = null;

    videoCallbackID: number | undefined = undefined;

    facingMode: 'user' | 'environment' = 'environment';

    static styles = [
        css`
            :host {
                display: block;
            }

            canvas {
                width: 100%;
                border-radius: 8px;
            }

            #camera-toolbar {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 10px;

                position: fixed;
                bottom: 50px;
                right: 0;
                left: 0;
            }

            #more-toolbar {
                display: flex;
                align-items: center;
                justify-content: start;

                position: fixed;
                top: 20px;
                left: 10px;
            }

            #camera-toolbar fluent-button::part(control) {
                border: none;

                height: 64px;
                width: 64px;
                background: #8c6ee0;
                border-radius: 50%;
            }

            #camera-toolbar fluent-button img {
                width: 32px;
                height: 32px;
            }

            #facing-mode-button::part(control) {
                background: transparent;
            }

            #facing-mode-button img {
                width: 28px;
                height: 28px;
            }

            @media(prefers-color-scheme: dark) {
                fluent-button img {
                    filter: invert(1);
                }
            }
        `
    ];

    public async startCamera() {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: {
            facingMode: this.facingMode
        }, audio: false });

        // @ts-ignore
        this.imageCapture = new ImageCapture(this.stream!.getVideoTracks()[0]);

        // play stream on canvas
        const canvas = this.shadowRoot!.querySelector('canvas');
        const ctx = canvas!.getContext('2d');

        this.ctx = ctx;
        this.canvas = canvas;

        const video = document.createElement('video');
        video.srcObject = this.stream;

        this.video = video;

        video.onplaying = () => {
            this.drawFrame();
        }

        video.onloadedmetadata = () => {
            video.play();
            canvas!.width = video.videoWidth;
            canvas!.height = video.videoHeight;
        };
    }

    public stopCameraAndCleanup() {
        this.stream?.getTracks().forEach(track => track.stop());
        this.video?.remove();
        this.video?.cancelVideoFrameCallback(this.videoCallbackID!);

        this.ctx = null;
        this.canvas = null;
        this.video = null;
    }

    drawFrame() {
        this.videoCallbackID = this.video?.requestVideoFrameCallback(this.drawFrame.bind(this))
        this.ctx!.drawImage(this.video!, 0, 0, this.canvas!.width, this.canvas!.height);
    }

    async takePicture() {
        // take picture using the Media Capture API
        const photo = await this.imageCapture!.takePhoto();
        const url = URL.createObjectURL(photo);

        // fire event with the photo
        this.dispatchEvent(new CustomEvent('photo-taken', {
            detail: {
                photo: url
            }
        }));
        this.stopCameraAndCleanup();
    }

    async switchFacingMode() {
        await this.stopCameraAndCleanup();
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        await this.startCamera();
    }

    render() {
        return html`
           <div id="more-toolbar">
             <fluent-button id="facing-mode-button" @click="${() => this.switchFacingMode()}">
               <img src="/assets/camera-reverse-outline.svg" />
             </fluent-button>
           </div>

           <canvas></canvas>

           <div id="camera-toolbar">
              <fluent-button @click="${() => this.takePicture()}">
                <img src="/assets/camera-outline.svg" />
              </fluent-button>
           </div>
        `;
    }
}
