import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

@customElement('app-manage')
export class AppManage extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                margin-top: 64px;
                padding-left: 12px;
                padding-right: 12px;
                padding-bottom: 12px;

                display: flex;
                align-items: center;
                justify-content: center;

                height: 50vh;
            }

            sl-card {
                --sl-panel-background-color: #373737;
                --border-radius: 10px;
            }

            sl-card h2, sl-card p {
                margin: 0;
            }

            #footer-slot {
                display: flex;
                justify-content: flex-end;
            }

            #footer-slot sl-button::part(base) {
                background-color: #6b62fc;
                border-color: transparent;
                color: white;
            }

            @media(prefers-color-scheme: light) {
                sl-card {
                    --sl-panel-background-color: #8080804a;
                }
            }
        `
    ];

    render() {
        return html`
          <main>
          <sl-card class="card-basic">
            <div slot="header">
                <h2>Manage Subscription</h2>
            </div>

             <p>You will be taken to Stripe, our payments partner, to manage your subscription.</p>

             <div id="footer-slot" slot="footer">
                <sl-button variant="primary" href="https://billing.stripe.com/p/login/8wMaHA9sI4oq9c49AA">Manage</sl-button>
            </div>
          </sl-card>
          </main>
        `;
    }
}