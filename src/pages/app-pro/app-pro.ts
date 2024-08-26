import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('app-pro')
export class AppPro extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            main {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 4em;

                padding: 18px;
                text-align: center;

                overflow-y: auto;
                max-height: 88vh;
                margin-top: 0;
            }

            main ul {
                margin-top: 0;
                margin-bottom: 26px;

                list-style-type: none;
                padding: 0;

                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            main ul li {
                background: #ffffff0f;
                border-radius: 8px;
                padding: 8px;
            }

            main h2 {
                font-weight: 700;
                color: rgb(135, 105, 220);
                font-size: 54px;
                margin-top: 0px;
                text-wrap: pretty;
                text-shadow: rgba(135, 105, 220, 0.51) 2px 2px;
            }

            main h3 {
                font-size: 30px;
            }

            fluent-button, fluent-text-field, fluent-listbox, fluent-card, fluent-tooltip {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
            }


            @media (max-width: 640px) {
              form {
                position: fixed;
                bottom: 10px;
                left: 18px;
                right: 18px;
              }

              form fluent-button {
                    width: 100%;
                    height: 3em;
                    font-weight: bold;
              }
            }


            @media (prefers-color-scheme: dark) {
              fluent-button::part(control) {
                color: white;
              }
            }

            @media (prefers-color-scheme: light) {
              main ul li {
                background: #E7E7E7;
              }
            }
        `
    ];

    render() {
        return html`
          <main>
            <h2>Get Skipper AI Pro</h2>
            <p>Subscribe to Skipper AI Pro for $15/month to unlock all features and remove the need for your own OpenAI key.</p>

            <h3>Features</h3>
            <ul>
                <li>Unlimited access to Skipper AI</li>
                <li>Always use the latest OpenAI models</li>
                <li>Remove the need for your own OpenAI key</li>
                <li>Unlock voice mode</li>
            </ul>

            <form action="https://skipper-stripe-server-qsqckaz7va-uc.a.run.app/create-checkout-session" method="post">
                <fluent-button appearance="accent" type="submit" size="large" id="checkout-button">Subscribe to Skipper AI Pro</fluent-button>
            </form>
           </main>
        `;
    }
}
