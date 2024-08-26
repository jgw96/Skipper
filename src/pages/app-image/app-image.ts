import { LitElement, PropertyValues, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import cssModule from './app-image.css?inline';

import { fluentTextArea, fluentProgressRing, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentTextArea(), fluentProgressRing());

@customElement('app-image')
export class AppImage extends LitElement {
    @state() loading = false;
    @state() generated: boolean = false;
    @state() currentPrompt: string = '';

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

    async doGenerate() {
        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        console.log("textArea", textArea?.value)
        if (textArea?.value) {
            this.currentPrompt = textArea.value;

            const { generateImage } = await import('../../services/ai');
            this.loading = true;
            const url = await generateImage(textArea.value);
            console.log('url', url);
            this.loading = false;

            this.generated = true;

            await this.updateComplete;

            const displayImage: any = this.shadowRoot?.querySelector('#display-image');
            displayImage.src = url;

            textArea.value = '';
        }

    }

    quickStyle(style: string) {
        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        textArea.value = `${textArea.value} In a ${style} style.`;
    }

    downloadImage() {
        console.log("download image");
        const displayImage: any = this.shadowRoot?.querySelector('#display-image');
        const url = displayImage.src;

        window.open(url, '_blank')
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

    render() {
        return html`
          <main>

          <sl-dialog class="upgrade-dialog" label="Upgrade to Skipper Pro" modal no-header>
            <h2>Upgrade to Skipper Pro</h2>
            <p>This feature is only available to Skipper Pro users. Upgrade now to get access to this feature and much more!</p>

            <fluent-anchor id="upgrade-link" href="/pro" appearance="accent">Upgrade Now</fluent-anchor>
            <fluent-anchor id="cancel-link" href="/" appearance="light">Go Back Home</fluent-anchor>
          </sl-dialog>

          ${this.loading === true ? html`
              <div id="generating-spinner">
                <p>Generating Image...</p>
                <fluent-progress-ring></fluent-progress-ring>
          </div>
            ` : null
            }

          <div id="generated-buttons">
                  ${this.generated ? html`<fluent-button id="download-button" size="small" appearance="accent" @click="${this.downloadImage}">Download</fluent-button>` : null}
                  ${this.generated ? html`<fluent-button id="regen-button" size="small" @click="${this.regen}">Regenerate</fluent-button>` : null}
    </div>

            <div id="image-block">
                ${this.generated ? html`
              <img id="display-image" src="/assets/icons/maskable_icon_x192.png" alt="Generated Image" />
              ` : html`
                <h2>Generate an image of anything using AI</h2>
              `}
            </div>


            <div id="image-input-outer">
                <div id="image-input-block">

                    <div id="quick-styles">
                        <p>Style Modifiers</p>

                        <div id="style-buttons">
                        <fluent-button @click="${() => this.quickStyle("cartoon")}">Cartoon</fluent-button>
                        <fluent-button @click="${() => this.quickStyle("sketch")}">Sketch</fluent-button>
                        <fluent-button @click="${() => this.quickStyle("oil painting")}">Oil Painting</fluent-button>
                        <fluent-button @click="${() => this.quickStyle("realistic")}">Realistic</fluent-button>
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
          </main>
        `;
    }
}
