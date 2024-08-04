import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fluentTextField, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentTextField());

@customElement('key-manager')
export class KeyManager extends LitElement {

    @state() keyUpdated: boolean = false;

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

            fluent-text-field {
                --neutral-fill-input-rest: var(--theme-color);
                --neutral-fill-input-hover: var(--theme-color);
                --neutral-fill-input-active: var(--theme-color);
                --neutral-fill-input-focus: var(--theme-color);
                background: var(--theme-color);
                color: white;
                border: none;

                border-radius: 8px;
            }

            fluent-text-field::part(root) {
                border: none;
                background: initial;
                border-radius: 8px;
            }


            .label {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 10px;
            }

            h3 {
                margin-top: 0;
                margin-bottom: 0;
                font-size: 16px;
            }

            p {
                font-size: 14px;
            }

            label {
                font-size: 12px;
                font-weight: bold;
            }

            #key-section {
                margin-bottom: 20px;
            }

            @media(prefers-color-scheme: light) {
              fluent-text-field {
                color: black;
              }
            }
        `
    ];

    async firstUpdated() {
        const { getGoogleKey, getOpenAIKey } = await import('../services/keys');
        const key = await getGoogleKey();

        console.log("Key", key)

        if (key) {
            const input = this.shadowRoot?.querySelector('#google-api-key') as any;
            input.value = key;
        }

        const gptKey = await getOpenAIKey();
        console.log("GPT Key", gptKey)

        if (gptKey) {
            const gptInput = this.shadowRoot?.querySelector('#gpt-api-key') as any;
            gptInput.value = gptKey;
        }
    }

    async handleGoogleChange(e: Event) {
        const target = (e.target as any);
        console.log(target.value);

        const { setGoogleKey } = await import('../services/keys');
        await setGoogleKey(target.value);
    }

    async handleGPTChange(e: Event) {
        const target = (e.target as any);
        console.log(target.value);

        const { setOpenAIKey } = await import('../services/keys');
        await setOpenAIKey(target.value);

        // emit custom event on the window
        window.dispatchEvent(new CustomEvent('gpt-key-changed', {
            detail: {
                key: target.value
            }
        }));

        this.keyUpdated = true;
    }

    save() {
        const gptInput = this.shadowRoot?.querySelector('#gpt-api-key') as any

        if (gptInput.value && gptInput.value.length > 0) {
            // fire custom event
            const event = new CustomEvent('keys-saved', {
                detail: {
                    google: "",
                    gpt: gptInput.value
                }
            });
            this.dispatchEvent(event);
        }
    }

    render() {
        return html`
          <div id="main-block">
            <h3>Key Manager</h3>
            <p>Manage your API key</p>

            <div id="key-section">
                <div class="label">
                  <label for="gpt-api-key">OpenAI API Key</label>
                  <fluent-text-field @change="${this.handleGPTChange}" id="gpt-api-key" type="text"></fluent-text-field>
                </div>
            </div>

            ${this.keyUpdated ? html`<fluent-button appearance="accent">Updated</fluent-button>` : html`<fluent-button appearance="accent" @click="${this.save}">Update</fluent-button>`}
          </div>
        `;
    }
}
