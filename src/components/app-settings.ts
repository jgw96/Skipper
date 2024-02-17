import { LitElement, css, html } from "lit";

import { customElement } from "lit/decorators.js";

import {
    provideFluentDesignSystem,
    fluentSelect,
    fluentOption
} from "@fluentui/web-components";
import { setChosenModelShipper } from "../services/ai";

provideFluentDesignSystem()
    .register(
        fluentSelect(),
        fluentOption()
    );

@customElement("app-settings")
export class AppSettings extends LitElement {

    static get styles() {
        return css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .setting {
            display: flex;
            gap: 14px;
            flex-direction: column;

            background: #ffffff0f;
            padding: 8px;
            border-radius: 8px;
        }

        .setting h3 {
            margin: 0;
        }

        .setting p {
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 0;
        }

        fluent-option {
            margin-top: 3px;
            margin-bottom: 3px;
        }

        label {
            font-weight: bold;
        }

        @media(prefers-color-scheme: dark) {
            fluent-select::part(control), fluent-select::part(listbox) {
                --neutral-fill-rest: var(--theme-color);
                --neutral-fill-hover: var(--theme-color);
                --neutral-fill-active: var(--theme-color);
                color: white;
                border: none;
              }

              fluent-select::part(listbox), fluent-option {
                background: var(--theme-color);
                color: white;
              }

              fluent-button::part(control) {
                background: #3f434e;
                border: none;
              }
        }

        @media(prefers-color-scheme: light) {
            fluent-select::part(control) {
                --neutral-fill-rest: var(--theme-color);
                --neutral-fill-hover: var(--theme-color);
                --neutral-fill-active: var(--theme-color);
                color: black;
                border: none;
              }

              .setting h3 {
                color: white;
              }

              fluent-select::part(listbox) {
                background: #9d9d9d;
                color: white;
              }

              fluent-option {
                background: white;
              }

              .setting {
                background: #0000002b;
              }
        }
        `;
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        const theme = localStorage.getItem('theme');
        const themeInput = this.shadowRoot?.querySelector('#theme') as any;
        if (theme) {
            console.log("theme loaded", theme, themeInput);
            themeInput.currentValue = theme;
            console.log("theme loaded", themeInput.currentValue);
            document.documentElement.setAttribute('data-theme', theme);
        }
        else {
            themeInput.currentValue = 'fluent';
            document.documentElement.setAttribute('data-theme', 'fluent');
        }

        (this.shadowRoot?.querySelector('#theme') as any).addEventListener('change', (e: any) => {
            localStorage.setItem('theme', e.target.value);
            document.documentElement.setAttribute('data-theme', e.target.value);
        });

        const model = localStorage.getItem('model');
        const modelInput = this.shadowRoot?.querySelector('#model') as any;
        if (model) {
            modelInput.currentValue = model;

            setChosenModelShipper((model as "openai" | "google"));
        }
        else {
            modelInput.currentValue = 'openai';
            setChosenModelShipper('openai');
        }
    }

    chooseTheme($event: any) {
        localStorage.setItem('theme', $event.target.value);
        document.documentElement.setAttribute('data-theme', $event.target.value);

        const event = new CustomEvent('theme-changed', {
            detail: {
                theme: $event.target.value
            }
        });
        this.dispatchEvent(event);
    }

    chooseModel($event: any) {
        setChosenModelShipper($event.target.value);

        localStorage.setItem('model', $event.target.value);
        const event = new CustomEvent('model-changed', {
            detail: {
                model: $event.target.value
            }
        });
        this.dispatchEvent(event);
    }

    async exportData() {
        const { exportAllConversations } = await import('../services/storage');
        await exportAllConversations();
    }

    render() {
        return html`
            <div class="setting">
                <h3>About Charles</h3>

                <p>
                    Charles is a multi-modal AI chatbot that is fully in your control. You can chat either with GPT-4, or
                    Google's Gemini Pro. Charles can work with you how you want, want to interact with your voice? You can.
                    Need Charles to see something? Give it an image! Simply want text chat? That works too.

                    Charles works on any of your devices!
                </p>
            </div>

            <div class="setting">
                <label for="model">Choose AI Model</label>
                <fluent-select @change="${this.chooseModel}" id="model" title="Select an AI model">
                    <fluent-option value="openai">GPT-4</fluent-option>
                    <!-- <fluent-option value="fluent-darker">Fluent with darker dark mode</fluent-option> -->
                    <fluent-option value="google">Google Gemini Pro</fluent-option>
                </fluent-select>
            </div>

            <div class="setting">
                <label for="theme">Choose Theme</label>
                <fluent-select @change="${this.chooseTheme}" id="theme" title="Select a theme">
                    <fluent-option value="fluent">Fluent</fluent-option>
                    <!-- <fluent-option value="fluent-darker">Fluent with darker dark mode</fluent-option> -->
                    <fluent-option value="pastel">Pastel</fluent-option>
                </fluent-select>
            </div>

            <div class="setting">
                <label for="export">Export Data</label>
                <fluent-button id="export" @click="${this.exportData}">Export</fluent-button>
            </div>
    `;
    }
}