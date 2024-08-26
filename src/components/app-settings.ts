import { LitElement, css, html } from "lit";

import { customElement, state } from "lit/decorators.js";

import "./key-manager";
import "./app-actions";
import "./app-account";

import {
    provideFluentDesignSystem,
    fluentSelect,
    fluentOption,
    fluentSwitch
} from "@fluentui/web-components";
import { setChosenModelShipper } from "../services/ai";
import { auth } from "../services/auth/firebase-auth";
import { checkPlusSub } from "../services/settings";

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
    @state() authed: boolean = false
    @state() proFlag: boolean = false;

    static get styles() {
        return css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 12px;

            overflow: hidden;
        }

        fluent-anchor {
              width: fit-content;
    place-self: flex-end;
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
            margin-bottom: 8px;
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
                --neutral-fill-input-alt-rest: #9b9b9b;
                --neutral-foreground-rest: white;
              }

              fluent-select::part(listbox), fluent-option {
                background: var(--theme-color);
                color: white;
              }

              fluent-button::part(control), fluent-anchor::part(control) {
                background: #8769dc;
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
        this.proFlag = await checkPlusSub();
        console.log("proFlag", this.proFlag);

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

        const offlineready = localStorage.getItem('offlineready');
        const offlinereadyInput = this.shadowRoot?.querySelector('#offlineReady') as any;
        if (offlineready) {
            offlinereadyInput.checked = offlineready === 'true';
            offlinereadyInput.setAttribute('checked', offlineready === 'true');
        }
        else {
            offlinereadyInput.checked = false;
            offlinereadyInput.setAttribute('checked', 'false');
        }

        // const user = auth.currentUser;
        // this.authed = user !== null;
        let user = auth.currentUser;
        if (!user) {
            window.addEventListener('auth-changed', async (e: any) => {
                console.log("auth changed", e.detail.currentUser);
                user = e.detail.currentUser;

                console.log("currentUser", user);

                this.authed = user !== null;

                if (this.authed) {
                    await this.updateComplete;

                    const cloudSync = localStorage.getItem('cloudSync') === 'true' ? true : false;
                    console.log("cloudSync", cloudSync);
                    const cloudSyncInput = this.shadowRoot?.querySelector('#sync') as any;
                    if (cloudSync) {
                        cloudSyncInput.checked = cloudSync === true;
                        cloudSyncInput.setAttribute('checked', cloudSync === true);
                    }
                    else {
                        cloudSyncInput.checked = false;
                        cloudSyncInput.setAttribute('checked', 'false');
                    }
                }
            });
        }
        else {
            await this.updateComplete;

            const cloudSync = localStorage.getItem('cloudSync') === 'true' ? true : false;
            console.log("cloudSync", cloudSync);
            const cloudSyncInput = this.shadowRoot?.querySelector('#sync') as any;
            if (cloudSync) {
                cloudSyncInput.checked = cloudSync === true;
                cloudSyncInput.setAttribute('checked', cloudSync === true);
            }
            else {
                cloudSyncInput.checked = false;
                cloudSyncInput.setAttribute('checked', 'false');
            }
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

    chooseCloudSync($event: any) {
        localStorage.setItem('cloudSync', $event.target.checked ? 'true' : 'false');

        this.dispatchEvent(new CustomEvent("cloud-sync-changed", {
            detail: {
                cloudSync: $event.target.checked
            }
        }))

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

    async prepareForOffline(event: any) {
        if (event?.target.checked) {
            localStorage.setItem('offlineready', 'true');
            const { loadAndSetupLocal } = await import('../services/ai');
            await loadAndSetupLocal();
        }
        else {
            localStorage.removeItem('offlineready');
        }
    }

    render() {
        return html`

        <div class="setting">
            <app-account></app-account>
    </div>

            ${!this.proFlag ? html`<div class="setting">
                <key-manager></key-manager>
            </div>` : null}

            ${
                this.proFlag ? html`
                  <div class="setting">
                    <h3>Manage Subscription</h3>

                    <p>
                        You are a Skipper Plus subscriber. Thank you for supporting Skipper!
                    </p>

                    <fluent-anchor href="/manage" id="manage-link">
                        Manage Subscription
                    </fluent-anchor>
                ` : null
            }

            ${this.authed ? html`
                  <div class="setting">
                    <label for="sync">Sync Conversations to the Cloud</label>
                    <fluent-switch  @change="${this.chooseCloudSync}" id="sync" title="Sync Conversations to the Cloud">
                        <span slot="checked-message">On</span>
                        <span slot="unchecked-message">Off</span>
                    </fluent-switch>

                    <p>
                        Sync your conversations to the cloud. This will allow you to access your conversations on any device.
            </p>
                  </div>
                ` : null
            }


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
                <label for="offlineReady">Load model for offline</label>
                <fluent-switch .checked="${this.highVoiceQuality}" @change="${this.prepareForOffline}" id="offlineReady" title="Load model for offline">
                    <span slot="checked-message">Ready</span>
                    <span slot="unchecked-message">Not Ready</span>
                </fluent-switch>

                <p>
                    If you expect to use Skipper offline in the future, you can load and cache the model while you are online.
                    Once the model is cached, the local model will be automatically used if Skipper detects it is offline. Note, this does not
                    automatically start using the local model, it just prepares it for offline use.

                    To only use the local model, turn on Local Mode.
                </p>
            </div>


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

            <div class="setting">
                <h3>About Skipper</h3>

                <p>
                    Skipper is a powerful multi-modal AI assistant.
                    Skipper can work with you how you want. Want to interact with your voice? You can.
                    Need Skipper to see something? Give it an image! Simply want text chat? That works too.
                </p>
            </div>
    `;
    }
}