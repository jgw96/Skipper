import { LitElement, html, unsafeCSS } from 'lit';
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

    render() {
        return html`
          <main>

          ${
            this.loading === true ? html`
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
