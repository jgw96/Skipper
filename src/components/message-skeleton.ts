import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('message-skeleton')
export class MessageSkeleton extends LitElement {
    static styles = [
        css`
            :host {
                display: block;

                overflow-x: hidden;
            }

            .skeleton {
                background: #ffffff0f;
                margin-bottom: 4px;

                width: 48vw;
                height: 25px;
                border-radius: 4px;

                overflow-x: hidden;
            }

            .skeleton#second {
                width: 30vw;
            }

            .shimmer {
                background: linear-gradient(to right, #ffffff0f, #5c5c5c , #ffffff0f);
                animation: shimmer 2s infinite linear;
            }


            @media(prefers-color-scheme: light) {
                .skeleton {
                    background: #e1e1e1;
                }

                .shimmer {
                    background: linear-gradient(to right, #e1e1e1, #f1f1f1 , #e1e1e1);
                }
            }

            @keyframes shimmer {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(100%);
                }
            }
        `
    ];

    render() {
        return html`
           <div class="skeleton shimmer">
           </div>

           <div class="skeleton shimmer" id="second"></div>
        `;
    }
}
