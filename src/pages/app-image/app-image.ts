import { LitElement, PropertyValues, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import cssModule from './app-image.css?inline';

import { fluentTextArea, fluentProgressRing, provideFluentDesignSystem } from '@fluentui/web-components';
import { fileOpen } from 'browser-fs-access';

provideFluentDesignSystem().register(fluentTextArea(), fluentProgressRing());

@customElement('app-image')
export class AppImage extends LitElement {
    @state() loading = false;
    @state() generated: boolean = false;
    @state() currentPrompt: string = '';
    @state() currentStyle: string = 'photographic';
    @state() currentRatio: string = '1:1';

    @state() originalImage: any;

    static styles = [
        unsafeCSS(cssModule)
    ];

    protected async firstUpdated(_changedProperties: PropertyValues): Promise<void> {
        super.firstUpdated(_changedProperties);
        this.setupDraggable();

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
    }

    setupPinchZoom(img: HTMLImageElement) {
        let initialDistance: any = null;
        let scale = 1;
        let originX = 0;
        let originY = 0;

        img.addEventListener('touchstart', function (event) {
            if (event.touches.length === 2) {
                event.preventDefault();

                // Get the midpoint between the two fingers as the pinch starting point
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                originX = (touch1.pageX + touch2.pageX) / 2;
                originY = (touch1.pageY + touch2.pageY) / 2;

                // Set the transform origin to the pinch point
                const imgRect = img.getBoundingClientRect();
                const offsetX = originX - imgRect.left;
                const offsetY = originY - imgRect.top;
                img.style.transformOrigin = `${(offsetX / imgRect.width) * 100}% ${(offsetY / imgRect.height) * 100}%`;

                // Calculate the initial distance between fingers
                initialDistance = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
            }
        });

        img.addEventListener('touchmove', function (event) {
            if (event.touches.length == 2) {
                event.preventDefault(); // Prevent page scroll

                const touch1 = event.touches[0];
                const touch2 = event.touches[1];

                // Calculate the current distance between fingers
                const currentDistance = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);

                if (initialDistance) {
                    // Adjust the scale based on the distance change
                    scale = currentDistance / initialDistance;

                    // Apply the zoom scale to the image
                    img.style.transform = `scale(${scale})`;
                }
            }
        });

        img.addEventListener('touchend', function (event) {
            if (event.touches.length < 2) {
                initialDistance = null; // Reset when pinch gesture ends
            }
        });
    }

    async doGenerate() {
        // const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        // console.log("textArea", textArea?.value)
        // if (textArea?.value) {
        //     this.currentPrompt = textArea.value;

        //     const { generateImage } = await import('../../services/ai');
        //     this.loading = true;
        //     const url = await generateImage(textArea.value);
        //     console.log('url', url);
        //     this.loading = false;

        //     this.generated = true;

        //     await this.updateComplete;

        //     const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        //     displayImage.src = url;

        //     textArea.value = '';
        // }

        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        if (textArea?.value) {
            this.currentPrompt = textArea.value;

            const { generatePhotoWithStableCore } = await import('../../services/images/stability');
            this.loading = true;
            const blob = await generatePhotoWithStableCore(textArea.value, this.currentStyle, this.currentRatio);
            this.loading = false;

            this.generated = true;

            this.originalImage = blob;

            await this.updateComplete;

            const displayImage: any = this.shadowRoot?.querySelector('#display-image');
            displayImage.src = URL.createObjectURL(blob);

            textArea.value = '';

            this.setupPinchZoom(displayImage);
        }

    }

    quickStyle(style: string) {
        this.currentStyle = style;
    }

    quickRatio(ratio: string) {
        this.currentRatio = ratio;
    }

    downloadImage() {
        // download the image
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        // make a blob from displayImage
        const a = document.createElement('a');
        a.href = url;

        // get the filename
        const filename = url.split('/').pop();
        a.download = filename;
        a.click();
    }

    async shareImage() {
        // share the image
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        const image = await fetch(url).then(response => response.blob());
        const fileEnding = this.originalImage.type.split('/')[1];
        const newFile = new File([image], `generated-image.${fileEnding}`, { type: this.originalImage.type });

        // share a blob of the image with the web share api
        if (navigator.share) {
            await navigator.share({
                title: 'Generated Image',
                text: 'Check out this generated image!',
                url: "",
                files: [newFile]
            })
        }
    }

    async copyImage() {
        // copy the image to the clipboard
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        const image = await fetch(url).then(response => response.blob());
        const imageType = 'image/png';

        const clippy = new ClipboardItem({
            [imageType]: image
        })

        navigator.clipboard.write([
            clippy
        ]);
    }

    async openImage() {
        // open the image in a new tab
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        window.open(url, '_blank');
    }

    regen() {
        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        textArea.value = this.currentPrompt;

        this.doGenerate();
    }

    setupDraggable() {
        const dragItem = this.shadowRoot?.querySelector('#image-input-block');
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

            // set active to true for dragItem and all children
            if (dragItem?.contains(e.target)) {
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

    async importImage() {
        const fileHandle = await fileOpen({
            mimeTypes: ['image/*'],
            extensions: ['.png', '.jpg']
        });

        if (fileHandle) {
            this.generated = true;
            await this.updateComplete;
            this.originalImage = fileHandle;
            const url = URL.createObjectURL(fileHandle);
            const displayImage: any = this.shadowRoot?.querySelector('#display-image');
            displayImage.src = url;

            this.setupPinchZoom(displayImage);
        }
    }

    async doRemoveBackground() {
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');

        const { removeBackground } = await import('../../services/images/stability');
        this.loading = true;

        const newBlob = await removeBackground(this.originalImage);
        this.loading = false;

        displayImage.src = URL.createObjectURL(newBlob);
    }

    async doUpscale() {
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');

        const { upscaleImage } = await import('../../services/images/stability');
        this.loading = true;
        const newBlob = (await upscaleImage(this.originalImage) as Blob);
        this.loading = false;

        displayImage.src = URL.createObjectURL(newBlob);
    }

    async doOutpaint() {
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        const response = await fetch(url);
        const blob = await response.blob();

        const { outpaint } = await import('../../services/images/stability');
        this.loading = true;
        const newBlob = await outpaint(blob);
        this.loading = false;

        displayImage.src = URL.createObjectURL(newBlob);
    }

    render() {
        return html`


          <main>

          <sl-dialog class="upgrade-dialog" label="Upgrade to Skipper Pro" modal no-header>
            <h2>Upgrade to Skipper Pro</h2>
            <p>This feature is only available to Skipper Pro users. Upgrade now to get access to this feature and much more!</p>

            <fluent-anchor id="upgrade-link" href="/pro" appearance="accent">Upgrade Now</fluent-anchor>
            <fluent-anchor id="cancel-link" href="/" appearance="light">Go Back Home</fluent-anchor>
          </sl-dialog>

          <!-- ${this.loading === true ? html`
              <div id="generating-spinner">
                <p>Generating Image...</p>
                <fluent-progress-ring></fluent-progress-ring>
          </div>
            ` : null
            } -->

            <div id="image-block">
                ${
                    this.loading === true && this.generated === false ? html`
                    <div class="gen-image-block">
                      <fluent-progress-ring></fluent-progress-ring>
                    </div>
                    ` : null
                }
                ${this.generated ? html`
              <img id="display-image" src="/assets/icons/maskable_icon_x192.png" alt="Generated Image" />
              ` : this.loading === false ? html`
                <img id="intro-img" src="/assets/icons/256-icon.png" alt="Generated Image" />

                <p>Start by importing an image or generating a new image</p>
              ` : null}
            </div>


            <div id="image-input-outer" class="desktop">
                <div id="image-input-block">
                    <div class="generation-block">
                    <fluent-button @click="${() => this.importImage()}" id="upload-button" appearance="accent" type="primary">
                        Import Image
                    </fluent-button>

                    ${this.generated ? html`<div class="quick-actions">
                        <p>Actions</p>

                        <div id="actions-block">
                            <fluent-button id="remove-bg-button" @click="${this.doRemoveBackground}">
                                Remove Background
                            </fluent-button>

                            <div id="sub-actions">
                                <fluent-button id="upscale-button" @click="${this.downloadImage}">
                                    <img src="/assets/attach-outline.svg" alt="download" />
                                </fluent-button>

                                <fluent-button id="upscale-button" @click="${this.shareImage}">
                                    <img src="/assets/share-social-outline.svg" alt="share" />
                                </fluent-button>

                                <fluent-button id="upscale-button" @click="${this.openImage}">
                                    <img src="/assets/copy-outline.svg" alt="copy" />
                                </fluent-button>
                            </div>
                        </div>
                    </div>` : null}
                    </div>

                    <div class="generation-block">

                    <div class="quick-actions">
                        <p id="styles-header">Styles</p>

                        <div id="style-buttons">
                            <fluent-button class="${classMap({ selected: this.currentStyle === "3d-model" })}" @click="${() => this.quickStyle("3d-model")}">3d model</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "analog-film" })}" @click="${() => this.quickStyle("analog-film")}">Analog Film</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "anime" })}" @click="${() => this.quickStyle("anime")}">Anime</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "fantasy-art" })}" @click="${() => this.quickStyle("fantasy-art")}">Fantasy</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "comic-book" })}" @click="${() => this.quickStyle("comic-book")}">Comic Book</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "neon-punk" })}" @click="${() => this.quickStyle("neon-punk")}">Neon</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "low-poly" })}" @click="${() => this.quickStyle("low-poly")}">Low Poly</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentStyle === "pixel-art" })}" @click="${() => this.quickStyle("pixel-art")}">Pixel Art</fluent-button>
                        </div>
                    </div>

                    <div class="quick-actions aspect-ratio">
                        <p>Aspect Ratio</p>
                        <div id="style-buttons">
                            <fluent-button class="${classMap({ selected: this.currentRatio === "16:9" })}" @click="${() => this.quickRatio("16:9")}">Desktop</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentRatio === "9:21" })}" @click="${() => this.quickRatio("9:21")}">Mobile</fluent-button>
                            <fluent-button class="${classMap({ selected: this.currentRatio === "1:1" })}" @click="${() => this.quickRatio("1:1")}">Social</fluent-button>
                        </div>
                    </div>

                        <div id="image-input-inner">
                            <fluent-text-area placeholder="Generate an image..."></fluent-text-area>
                            <fluent-button ?loading="${this.loading}" ?disabled="${this.loading}" appearance="accent" type="primary" @click=${this.doGenerate}>
                                <img src="/assets/send-outline.svg" alt="send" />
                            </fluent-button>
                        </div>

                    </div>
                </div>
            </div>
          </main>
        `;
    }
}
