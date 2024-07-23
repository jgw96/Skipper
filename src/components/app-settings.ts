import { LitElement, css, html } from "lit";

import { customElement, state } from "lit/decorators.js";

import "./key-manager";
import "./app-actions";

import {
    provideFluentDesignSystem,
    fluentSelect,
    fluentOption,
    fluentSwitch
} from "@fluentui/web-components";
import { setChosenModelShipper } from "../services/ai";

provideFluentDesignSystem()
    .register(
        fluentSelect(),
        fluentOption(),
        fluentSwitch()
    );

@customElement("app-settings")
export class AppSettings extends LitElement {

    @state() gpuCheck: boolean = false;
    @state() selectedModel: string = "openai";
    @state() highVoiceQuality: boolean = true;

    static get styles() {
        return css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 12px;
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

        fluent-switch[checked], fluent-switch.checked {
            --accent-fill-rest: #8769dc;
            --accent-fill-hover: #8769dc;
            --accent-fill-active: #8769dc;
            --neutral-fill-rest: #8769dc;
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

              fluent-switch {
                --neutral-foreground-rest: white;
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

              .setting {
                color: black;
                background: white;
              }

              fluent-select::part(listbox) {
                background: #9d9d9d;
                color: white;
              }

              fluent-option {
                background: white;
              }
        }
        `;
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        document.documentElement.setAttribute('data-theme', 'fluent');

        const model = localStorage.getItem('model');
        // const modelInput = this.shadowRoot?.querySelector('#model') as any;
        // if (model) {
        //     this.selectedModel = model;

        //     this.requestUpdate(this.selectedModel);

        //     setChosenModelShipper((model as "openai" | "google" | 'redpajama' | 'llama' | 'gemma'));
        // }
        // else {
        //     modelInput.currentValue = 'openai';
        //     setChosenModelShipper('openai');
        // }
        if (model) {
            this.selectedModel = model;
            this.requestUpdate(this.selectedModel);

            setChosenModelShipper((model as "openai" | "google" | 'redpajama' | 'llama' | 'gemma' | 'phi3'));

            if (model === 'phi3') {
                this.gpuCheck = true;
            }
        }
        else {
            setChosenModelShipper('openai');
            this.gpuCheck = false;
        }

        const voiceQuality = localStorage.getItem('voiceQuality');
        const voiceQualityInput = this.shadowRoot?.querySelector('#voiceQuality') as any;
        if (voiceQuality) {
            voiceQualityInput.checked = voiceQuality === 'high';
            voiceQualityInput.setAttribute('checked', voiceQuality === 'high');

            this.highVoiceQuality = voiceQuality === "high";
        }
        else {
            voiceQualityInput.checked = true;
            voiceQualityInput.setAttribute('checked', 'true');
            this.highVoiceQuality = true;
        }
    }

    chooseModel($event: any) {
        setChosenModelShipper($event.target.value);

        localStorage.setItem('model', $event.target.value);

        this.dispatchEvent(new CustomEvent('theme-changed', {
            detail: {
                model: $event.target.value
            }
        }));
    }

    chooseLocalModel($event: any) {
        if ($event.target.checked === true) {
            setChosenModelShipper("phi3");

            localStorage.setItem('model', 'phi3');

            this.dispatchEvent(new CustomEvent('theme-changed', {
                detail: {
                    model: 'phi3'
                }
            }));
        }
        else {
            setChosenModelShipper("openai");

            localStorage.setItem('model', 'openai');

            this.dispatchEvent(new CustomEvent('theme-changed', {
                detail: {
                    model: 'openai'
                }
            }));
        }
    }

    chooseVoiceQuality($event: any) {
        localStorage.setItem('voiceQuality', $event.target.checked ? 'high' : 'low');

        this.dispatchEvent(new CustomEvent('theme-changed', {
            detail: {
                voiceQuality: $event.target.checked ? 'high' : 'low'
            }
        }));
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
                    Skipper is a powerful multi-modal AI assistant.
                    Skipper can work with you how you want. Want to interact with your voice? You can.
                    Need Skipper to see something? Give it an image! Simply want text chat? That works too.
                </p>
            </div>

            <div class="setting">
                <key-manager></key-manager>
            </div>

           ${"gpu" in navigator ? html`<div class="setting">
                <label for="local">Local Mode</label>
                <fluent-switch .checked="${this.gpuCheck}" @change="${this.chooseLocalModel}" id="local" title="Local Mode">
                    <span slot="checked-message">On</span>
                    <span slot="unchecked-message">Off</span>
                </fluent-switch>

                <p>
                    Local mode is slower in some cases, uses more battery on devices without a dedicated NPU, and currently does not support actions. It does however ensure your data never leaves your device.
            </div>` : null}

            <!-- <div class="setting">
                <label for="model">Choose AI Model</label>
                <fluent-select @change="${this.chooseModel}" .currentValue="${this.selectedModel}" id="model" title="Select an AI model">
                    <fluent-option value="openai">Cloud: OpenAI GPT-4</fluent-option>
                    <fluent-option value="google">Cloud: Google Gemini Pro</fluent-option>
                    <fluent-option value="redpajama">Local: RedPajama-INCITE-Chat-3B-v1-q4f32_1</fluent-option>
                    <fluent-option value="llama">Local: Llama-2-7b-chat-hf-q4f32_1</fluent-option>
                    <fluent-option value="gemma">Local: Gemma-2b-it-q4f16_1</fluent-option>
                </fluent-select>

                <p>
                    Choose the AI model Skipper uses to chat to you. The cloud models are more powerful, faster and can work on any device.
                    However, the local models ensure your chat never leaves the device. Be aware though that the local model may be slower, much slower depending on your device,
                    and will use more battery. For the best local model performance, use a device with a dedicated GPU.
                </p>
            </div> -->

            <div class="setting">
                <label for="voiceQuality">Voice Quality</label>
                <fluent-switch .checked="${this.highVoiceQuality}" @change="${this.chooseVoiceQuality}" id="voiceQuality" title="Voice Quality">
                    <span slot="checked-message">High</span>
                    <span slot="unchecked-message">Low</span>
                </fluent-switch>

                <p>
                    Choose the quality of the voice synthesis. High quality will sound more natural but will take longer to generate before speaking.
                    Low quality will sound more robotic but will be faster.
                </p>
            </div>

            <div class="setting">
                <app-actions></app-actions>
    </div>

            <div class="setting">
                <label for="export">Export Data</label>
                <fluent-button id="export" @click="${this.exportData}">Export</fluent-button>
            </div>
    `;
    }
}