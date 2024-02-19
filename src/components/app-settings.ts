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
            font-size: 16px;
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
                <h3>About Skipper</h3>

                <p>
                    Skipper is a multi-modal, multi-model AI assistant.
                    Skipper can work with you how you want. Want to interact with your voice? You can.
                    Need Skipper to see something? Give it an image! Simply want text chat? That works too.
                    Want to chat with OpenAI's GPT-4? Or Google's Gemini Pro? Or, want to chat with a model that
                    runs locally on your device? You can do that too. Skipper is designed to be flexible and work with you.
                </p>
            </div>

            <div class="setting">
                <label for="model">Choose AI Model</label>
                <fluent-select @change="${this.chooseModel}" id="model" title="Select an AI model">
                    <fluent-option value="openai">Cloud: OpenAI GPT-4</fluent-option>
                    <!-- <fluent-option value="fluent-darker">Fluent with darker dark mode</fluent-option> -->
                    <fluent-option value="google">Cloud: Google Gemini Pro</fluent-option>
                    <fluent-option value="redpajama">Local: RedPajama-INCITE-Chat-3B-v1-q4f32_1</fluent-option>
                </fluent-select>

                <p>
                    Choose the AI model Skipper uses to chat to you. The cloud models are more powerful, faster and can work on any device.
                    However, the local models ensure your chat never leaves the device. Be aware though that the local model may be slower, much slower depending on your device,
                    and will use more battery. For the best local model performance, use a device with a dedicated GPU.
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