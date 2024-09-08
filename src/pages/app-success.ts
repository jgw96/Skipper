import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js'
import { router } from '../router';
import { set } from 'idb-keyval';

@customElement('app-success')
export class AppSuccess extends LitElement {
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

                text-align: center;
                margin-left: 8vw;
                margin-right: 8vw;
            }

            #enhanced {
                font-weight: bold;
            }

            fluent-button, fluent-text-field, fluent-listbox, fluent-card, fluent-tooltip {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
            }

            h2 {
              font-weight: 700;
              color: rgb(135, 105, 220);
              font-size: 54px;
              margin-top: 0px;
              text-wrap: pretty;
              text-shadow: rgba(135, 105, 220, 0.51) 2px 2px;
            }

            @media (max-width: 640px) {
              fluent-button {
                position: fixed;
                bottom: 10px;
                left: 18px;
                right: 18px;
                height: 3em;
                font-weight: bold;
              }
            }

            @media (prefers-color-scheme: dark) {
              fluent-button::part(control) {
                color: white;
              }
            }

        `
    ];

    async goHome() {
        await set("plus-sub", true);

        // emit custom event on window
        window.dispatchEvent(new CustomEvent('plus-sub'));

        router.navigate('/');
    }

    render() {
        return html`
          <main>
            <h2>Thanks for Subscribing!</h2>

            <p>You will be promptly issued an email confirmation confirming your subscription, accompanied by a convenient link to manage your subscription.</p>

            <fluent-button appearance="accent" @click="${() => this.goHome()}">Go Home</fluent-button>
          </main>
        `;
    }
}