import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { fluentSkeleton, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentSkeleton());

@customElement('message-skeleton')
export class MessageSkeleton extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-skeleton {
                background: #ffffff0f;
                --skeleton-fill: #3c3c3c;
                --neutral-fill-secondary-hover: #4a4949;
                margin-bottom: 4px;

                width: 80%;
                height: 25px;
                border-radius: 4px;
            }

            @media(prefers-color-scheme: light) {
                fluent-skeleton {
                    --skeleton-fill: #e1e1e1;
                    --neutral-fill-secondary-hover: #f1f1f1;
                }
            }

            @media(max-width: 680px) {
                fluent-skeleton {
                    width: 60vw;
                }
            }
        `
    ];

    render() {
        return html`
          <fluent-skeleton
            shimmer
            shape="rect"
        ></fluent-skeleton>

        <fluent-skeleton
            shimmer
            shape="rect"
        ></fluent-skeleton>
        `;
    }
}
