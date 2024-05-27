import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js'

@customElement('app-actions')
export class AppActions extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            #main-block {
                display: flex;
                flex-direction: column;
            }

            fluent-button {
                align-self: flex-end;
            }

            fluent-button, fluent-text-field, fluent-listbox, fluent-card, fluent-tooltip {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
              }

            h3 {
                margin-top: 0;
                margin-bottom: 0;
                font-size: 16px;
            }

            p {
                font-size: 14px;
            }

            #with-login {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            ul {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-left: 22px;
                font-weight: bold;
                font-size: 14px;
            }
        `
    ];

    render() {
        return html`
          <div id="main-block">
            <h3>Actions</h3>

            <p>
                Skipper supports "Actions", which are specific actions Skipper can take that build upon the standard GPT-4o capabilities.
                Like with other chat assistant apps, you can ask also Skipper to do more general tasks, such as generating emails, researching topics, and just general chatting etc.
                Here are some actions you can take:
            </p>

            <ul>
                <li>Get the latest news</li>
                <li>Get the latest news from a specific source</li>
                <li>Get the current weather or the weather forecast for the week</li>
                <li>Generate images, art and more</li>
            </ul>

            <p id="with-login">
            Login with Microsoft to enable even more actions:
             </p>

             <ul>
                <li>Manage your email</li>
                <li>Search your email</li>
                <li>Manage your tasks</li>
             </ul>
          </div>
        `;
    }
}
