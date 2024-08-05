import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUserPhoto, getUserProfile, logOut, signIn } from '../services/auth/auth';
import { baseLayerLuminance } from '@fluentui/web-components';

@customElement('app-login')
export class AppLogin extends LitElement {
    @state() displayName: string = '';
    @state() userPhoto: string = '/assets/icons/64-icon.png';

    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-button {
                animation: quickSlideFromLeft 0.3s;
                app-region: no-drag;
                height: 90%;
            }

            fluent-button::part(control) {
                background: #ffffff0f;
            }

            fluent-button img {
                margin-top: 6px;
                width: 24px;
                height: 24px;
            }

            fluent-button {
                font-size: 12px;
            }

            #block p {
                background: #ffffff0f;
                padding: 8px;
                border-radius: 8px;
                font-size: 12px;
                width: max-content;
            }

            img {
                height: 20px;
                margin-top: 8px;
                object-fit: cover;
                border-radius: 50%;
                cursor: pointer;

                animation: fadeIn 0.3s;
            }

            sl-dropdown {
              animation: fadeIn 0.8s;
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
        // setTimeout(async () => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            const profile: any = await getUserProfile(token);
            console.log("profile info", profile)

            if (profile) {
                this.displayName = profile.displayName;

                setTimeout(async () => {
                    const photo: Blob = await getUserPhoto(token);
                    console.log("photo", photo);
                    this.userPhoto = URL.createObjectURL(photo);
                }, 800);

                await this.updateComplete;

                const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (isDarkMode) {
                    const fluentMenu: any = this.shadowRoot?.querySelectorAll("sl-menu fluent-menu-item");
                    for (let i = 0; i < fluentMenu.length; i++) {
                        baseLayerLuminance.setValueFor(fluentMenu[i], 0.1)
                    }
                }
            }
        }
        // }, 1000);
    }

    async doSignIn() {
        console.log('Sign in with Microsoft');
        await signIn();

    }

    async doLogOut() {
        console.log('Log out');
        await logOut();
    }

    render() {
        return html`
          <div id="block">
            ${this.displayName ? html`<div id="photo-block">
                <sl-dropdown hoist>
                    <img slot="trigger" caret src="${this.userPhoto}" alt="User photo" />
                    <sl-menu>
                        <fluent-menu-item class="copy-button new-window-button" @click="${this.doLogOut}">

                        Sign Out
                        </fluent-menu-item>
                    </sl-menu>

                </sl-dropdown>
            </div>` : html`
            <fluent-button size="small" @click="${() => this.doSignIn()}"/>Sign in with Microsoft</fluent-button>
            `
            }
    </div>
        `;
    }
}
