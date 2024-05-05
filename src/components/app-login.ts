import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { signIn } from '../services/auth/auth';

@customElement('app-login')
export class AppLogin extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-button {
                animation: quickSlideFromLeft 0.3s;
            }

            fluent-button::part(control) {
                background: transparent;
            }

            fluent-button img {
                margin-top: 6px;
                width: 24px;
                height: 24px;
            }
        `
    ];

    doSignIn() {
        console.log('Sign in with Microsoft');

        signIn();

    }

    render() {
        return html`
          <div>
            <fluent-button @click="${() => this.doSignIn()}"/>Sign in with Microsoft</fluent-button>
    </div>
        `;
    }
}
