import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentTextArea, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentTextArea());

@customElement('app-image')
export class AppImage extends LitElement {
    @state() loading = false;
    @state() generated: boolean = false;
    @state() currentPrompt: string = '';

    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-button, fluent-text-area, fluent-listbox, fluent-card {
                --accent-fill-rest: #8c6ee0;
                --accent-stroke-control-rest: #8c6ee0;
                --accent-fill-active: #8c6ee0;
                --accent-stroke-control-active: #8c6ee0;
                --accent-fill-hover: #8c6ee0;
                --accent-stroke-control-hover: #8c6ee0;
              }

            main {
                margin-top: 30px;
              }

              #regen-button::part(control) {
                background: #ffffff0f;
                backdrop-filter: blur(40px);
              }

            #image-input-outer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
            }

            #generated-buttons {
                position: fixed;
                left: 0;
                right: 18px;
                display: flex;
                justify-content: flex-end;
                gap: 6px;
                top: 55px;

                animation: quickup 0.3s ease-in-out;
            }

              #image-input-block {
                display: flex;
                flex-direction: column;

                bottom: 8px;
                width: 46vw;
                right: 8px;
                padding: 8px;
                background: #ffffff0f;
                display: flex;
                justify-content: space-between;

                gap: 8px;

                backdrop-filter: blur(40px);
                border-radius: 6px;

                animation: quickup 0.3s ease;
              }

              #image-input-block fluent-text-area {
                flex: 1;
              }

              #image-input-inner {
                display: flex;
                align-items: center;
                gap: 8px;
              }

              #image-input-inner fluent-button {
                align-self: end;
                margin-bottom: 1px;
              }

              #image-input-block fluent-button img {
                width: 24px;
                height: 24px;
                margin-top: 6px;
              }

              #quick-styles fluent-button::part(control) {
                background: #202020;
              }

              #quick-styles p {
                font-size: 14px;
                color: white;
                font-weight: bold;
                margin-top: 8px;
              }

              fluent-text-area {
                border-radius: 8px;
              }

              fluent-text-area::part(root) {
                height: 2.8em;
              }

              #image-block {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                margin-top: 60px;

                flex-direction: column;
                gap: 8px;
              }

              #image-block h2 {
                font-weight: bold;
                font-size: 38px;
                width: 472px;
                color: #8c6ee0;
                font-size: 54px;
                margin-top: 28px;
                text-wrap: pretty;
                text-shadow: #8c6ee082 2px 2px;
            }

              #style-buttons {
                display: flex;
                gap: 4px;
              }

              #image-block img {
                width: 48vw;
                border-radius: 8px;
                box-shadow: 0px 0px 10px 0px #202020;
                animation: fadein 0.3s ease-in-out;
              }

              @media(prefers-color-scheme: dark) {
                fluent-text-area {
                    background: var(--theme-color);
                }

                fluent-text-area::part(control) {
                    background: var(--theme-color);
                    color: white;
                    backdrop-filter: blur(40px);
                  }
              }

              @media(prefers-color-scheme: light) {
                #image-input-block {
                  background: #8c6ee073;
                }

                #quick-styles fluent-button::part(control) {
                    background: #8c6ee0;
                    color: white;
                }

                fluent-text-area {
                    background: white;
                }

                #image-block img {
                    box-shadow: 0px 0px 18px 0px #202020a1;
                }
              }

              @media(max-width: 800px) {
                #image-input-block {
                    position: fixed;
                    width: initial;
                    left: 8px;
                }

                #image-block h2 {
                    width: 82%;
                }

                #image-block img {
                    width: 90vw;
                }

                #generated-buttons {
                    justify-content: center;
                    top: 36px;
                }
              }

              @keyframes quickup {
                from {
                  transform: translateY(30%);
                }
                to {
                  transform: translateY(0%);
                }
              }

              @keyframes fadein {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }

        `
    ];

    async doGenerate() {
        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        console.log("textArea", textArea?.value)
        if (textArea?.value) {
            this.currentPrompt = textArea.value;

            const { generateImage } = await import('../services/ai');
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
