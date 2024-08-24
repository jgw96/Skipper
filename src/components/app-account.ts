import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import './app-login';

@customElement('app-account')
export class AppAccount extends LitElement {
    static styles = [
        css`
            :host {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            h3 {
                margin-top: 0;
                margin-bottom: 0;
                font-size: 16px;
            }

            p {
                font-size: 14px;
            }

            #bottom {
                display: flex;
                flex-direction: column;
            }

            app-login {
                margin-bottom: 3px;
                place-self: end;
            }
        `
    ];

    render() {
        return html`
            <h3>Account</h3>

            <div id="bottom">
              <p>Sign in to sync your conversations across devices and enable actions such as checking your Outlook.</p>
              <app-login></app-login>
            </div>
        `;
    }
}
