import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentTextArea, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentTextArea());

@customElement('app-image')
export class AppImage extends LitElement {
    @state() loading = false;
    @state() generated: boolean = false;

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

              #image-input-block {
                display: flex;
                flex-direction: column;

                position: fixed;
                bottom: 8px;
                width: 36vw;
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

              #download-button {
                z-index: 2;
                position: fixed;
                bottom: 8px;
                left: 8px;

                animation: quickup 0.3s ease-in-out;
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
                    width: initial;
                    left: 8px;
                }

                #image-block img {
                    width: 90vw;
                }

                #download-button {
                    bottom: 19vh;
                    right: 8px;
                    left: initial;
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
            const { generateImage } = await import('../services/ai');
            this.loading = true;
            const url = await generateImage(textArea.value);
            console.log('url', url);
            this.loading = false;

            const displayImage: any = this.shadowRoot?.querySelector('#display-image');
            displayImage.src = url;

            this.generated = true;

            textArea.value = '';
        }
    }

    quickStyle(style: string) {
        const textArea: any = this.shadowRoot?.querySelector('fluent-text-area');
        textArea.value = `${textArea.value} In a ${style} style.`;
    }

    render() {
        return html`
          <main>

            <div id="image-block">
              <img id="display-image" src="/assets/icons/maskable_icon_x192.png" alt="Generated Image" />
            </div>

            ${this.generated ? html`<fluent-button id="download-button" size="small" appearance="accent">Download</fluent-button>` : null}

            <div id="image-input-block">

                <div id="quick-styles">
                    <p>Style Modifiers</p>

                    <div>
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
          </main>
        `;
    }
}
