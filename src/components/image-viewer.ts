import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('image-viewer')
export class ImageViewer extends LitElement {
    @property({ type: String }) src = '';
    @property({ type: String }) alt = '';

    static styles = [
        css`
            :host {
                display: block;
            }

            #image-viewer {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            img {
                border-radius: 8px;
                width: 100%;
                margin: 10px;
                box-shadow: 0px 2px 20px #0000004a;
            }

            fluent-button::part(control) {
                background: #ffffff0f;
            }

                           #actions {
                      display: flex;
                        gap: 8px;
                        /* background: grey; */
                        justify-content: flex-end;

                        margin-top: 14px;
                }

            @media (max-width: 768px) {
                :host {
                  height: 90vh;
                    display: flex;
                    flex-direction: column;
                    align-items: end;
                    justify-content: space-between;
                }
            }

            @media(min-width: 768px) {
              img {
                width: 50vw;
              }

              :host {
                display: flex;
                flex-direction: column-reverse;
              }

              #actions {
                margin-bottom: 14px;
              }
            }

            @media(prefers-color-scheme: dark) {
              fluent-button::part(control) {
                    background: rgba(255, 255, 255, 0.06);
                    border: none;
                }
            }
        `
    ];


    handleShare() {
        navigator.share({
            title: 'Image',
            text: 'Check out this image',
            url: this.src
        });
    }

    openInFullscreen() {
        const elem = this.shadowRoot!.querySelector('img');
        elem!.requestFullscreen();
    }

    render() {
        return html`
          <div id="image-viewer">
            <img src="${this.src}" alt="${this.alt}" />
          </div>

          <div id="actions">
            <fluent-button @click="${this.handleShare}">Share</fluent-button>
            <fluent-button @click="${this.openInFullscreen}">Open In Fullscreen</fluent-button>
          </div>
        `;
    }
}
