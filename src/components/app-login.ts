import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { baseLayerLuminance } from '@fluentui/web-components';

import "../services/auth/firebase-auth";
import { getUserPhoto } from '../services/auth/auth';

@customElement('app-login')
export class AppLogin extends LitElement {
    @state() displayName: string = '';
    @state() userPhoto: string | null = null;
    @state() currentUser: any;

    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-button {
                animation: quickSlideFromLeft 0.3s;
                app-region: no-drag;
            }

            fluent-button img {
                margin-top: 6px;
                width: 24px;
                height: 24px;
            }

            img {
                height: 24px;
                object-fit: cover;
                border-radius: 50%;
                cursor: pointer;

                animation: fadeIn 0.3s;
            }

            sl-dropdown {
              animation: fadeIn 0.8s;
              app-region: no-drag;
            }

            #photo-block {
                width: 42px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            sl-menu {
                width: fit-content;
                overflow-x: hidden;
                border-radius: 5px;
                border: none;
                background: #272727;
                padding: 4px;

                animation-name: fadeIn;
                animation-duration: 0.12s;
                animation-fill-mode: forwards;
                animation-timing-function: ease-in-out;
                transform-origin: top left;
            }

               fluent-button, fluent-text-field, fluent-listbox, fluent-card, fluent-tooltip {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
              }

                #accountDropdownBlock {
                    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 7em;
    gap: 8px;
    margin-right: 6em;

                }


            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }

                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `
    ];

    async firstUpdated() {


        window.addEventListener('auth-changed', async (e: any) => {
            console.log("auth changed", e.detail.currentUser);
            this.currentUser = e.detail.currentUser;

            console.log("currentUser", this.currentUser);

            const token = localStorage.getItem('accessToken');
            console.log('token for photo', token);
            if (token) {
                await this.setPhoto(token);
            }
        });
    }

    private async setPhoto(token: string) {
        const photo: Blob = await getUserPhoto(token);
        console.log("photo", photo);

        if (photo.type !== "application/json") {
            this.userPhoto = URL.createObjectURL(photo);
        }

        // annoying temporary fix for dark mode
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
            const fluentMenu: any = this.shadowRoot?.querySelectorAll("sl-menu fluent-menu-item");
            for (let i = 0; i < fluentMenu.length; i++) {
                baseLayerLuminance.setValueFor(fluentMenu[i], 0.1)
            }
        }
    }

    async doLogin() {
        const { login } = await import('../services/auth/firebase-auth');
        await login();
    }

    async doLoginMSFT() {
        const { loginWithMicrosoft } = await import('../services/auth/firebase-auth');
        const token = await loginWithMicrosoft();

        if (token) {
            await this.setPhoto(token);
        }
    }

    async doLogout() {
        this.currentUser = null;

        const { logout } = await import('../services/auth/firebase-auth');
        logout();
    }

    render() {
        return html`
          <div id="block">
            ${this.userPhoto ? html`<div id="photo-block">
                <sl-dropdown hoist>
                    <div id="accountDropdownBlock" slot="trigger" caret>
                      <img src="${this.userPhoto}" alt="User photo" />
                      ${this.currentUser ? html`<p>${this.currentUser.displayName}</p>` : null}
            </div>
                    <sl-menu>
                        <sl-menu-item class="copy-button new-window-button" @click="${this.doLogout}">

                        Sign Out
                        </sl-menu-item>
                    </sl-menu>

                </sl-dropdown>
            </div>` : html`
            <fluent-button appearance="accent" @click="${() => this.doLoginMSFT()}"/>Sign in with Microsoft</fluent-button>
            `
            }
    </div>
        `;
    }
}
