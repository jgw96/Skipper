import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './pages/app-home/app-home';
import './components/header';
import './components/app-settings';
import './components/key-manager';
import './styles/global.css';
import { router } from './router';

@customElement('app-index')
export class AppIndex extends LitElement {
  @state() gpuCheck: boolean = false;

  static get styles() {
    return css`
      sl-drawer::part(panel) {
        padding-top: env(titlebar-area-height, initial);
        background: transparent;
        backdrop-filter: blur(46px);
        -webkit-backdrop-filter: blur(46px);
      }

      fluent-button, fluent-text-area, fluent-listbox, fluent-card, fluent-tooltip {
        --accent-fill-rest: #8769dc;
        --accent-stroke-control-rest: #8769dc;
        --accent-fill-active: #8769dc;
        --accent-stroke-control-active: #8769dc;
        --accent-fill-hover: #8769dc;
        --accent-stroke-control-hover: #8769dc;
      }

      #intro-image-block {
        height: 38em;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #8769dc;
        padding: 18px;
        border-radius: 8px 0px 0px 8px;
      }

      #intro-content-block {
        padding-right: 12px;
        padding-top: 12px;
        padding-bottom: 12px;
      }

      key-manager {
        background: #ffffff0f;
        padding: 8px;
        border-radius: 8px;
      }

      .dialog-overview {
        --width: 62rem;
      }

      .dialog-overview::part(body) {
        display: flex;
        gap: 35px;
        align-items: center;
      }

      .dialog-overview img {
        border-radius: 50%;
        width: 300px;

        box-shadow: 0px 2px 20px #0000004a;
      }

      .dialog-overview::part(overlay) {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
      }

      .dialog-overview::part(panel) {
        border-radius: 8px;
      }

      .dialog-overview h1 {
        margin-top: 0;
      }

      .dialog-overview p {
        font-size: 14px;
      }

      .dialog-overview ol {
        margin-top: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 14px;
        padding-left: 17px;
      }

      .dialog-overview #intro-actions {
        display: flex;
        gap: 8px;
        flex-direction: column;
      }

      .dialog-overview #intro-actions fluent-button {
        align-self: flex-end;
        margin-top: 12px;
      }

      .dialog-overview::part(body) {
        padding: 0;
      }

      @media(prefers-color-scheme: light) {
        sl-drawer::part(panel) {
          background: #ebebeb;
        }

        .dialog-overview {
          --sl-panel-background-color: #ffffff40;
        }
      }

      @media(max-width: 780px) {
        .dialog-overview {
          --width: 100%;
        }

        .dialog-overview img, #intro-image-block {
          display: none;
        }

        .dialog-overview::part(body) {
          flex-direction: column;
          display: block;
        }

        #intro-content-block {
          padding: 12px;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        sl-drawer::part(panel) {
          width: env(viewport-segment-width 1 0);
        }
     }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    router.addEventListener('route-changed', () => {
      if ("startViewTransition" in document) {
        (document as any).startViewTransition(() => this.requestUpdate());
      }
      else {
        this.requestUpdate();
      }
    });

    this.gpuCheck = "gpu" in navigator;

    const firstTimeCheck = localStorage.getItem('firstTime');
    if (!firstTimeCheck) {
      const dialog = this.shadowRoot?.querySelector('.dialog-overview');
      if (dialog) {
        dialog.addEventListener('sl-request-close', (event: any) => {
          console.log("event", event.detail.source)
          if (event.detail.source === 'overlay' || event.detail.source === 'keyboard') {
            event.preventDefault();
          }
        });

        // @ts-ignore
        dialog.show();
      }
    }
  }

  doOpenSettings() {
    const drawer = this.shadowRoot?.querySelector('.settings-drawer');
    if (drawer) {
      // @ts-ignore
      drawer.show();
    }
  }

  modelChanged($event: CustomEvent) {
    console.log("model changed", $event.detail.model);
    const appHome: any = this.shadowRoot?.querySelector('app-home');
    if (appHome) {
      // appHome.handleModelChange($event.detail.model);
    }
  }

  cloudSyncChanged($event: CustomEvent) {
    const appHome: any = this.shadowRoot?.querySelector("app-home");
    if (appHome) {
      appHome.handleCloudSync($event.detail.cloudSync)
    }
  }

  async getStarted(type: "cloud" | "local") {
    if (type === "local") {
      const { setChosenModelShipper } = await import('./services/ai');
      setChosenModelShipper("phi3");

      localStorage.setItem('model', 'phi3');

      this.dispatchEvent(new CustomEvent('theme-changed', {
        detail: {
          model: 'phi3'
        }
      }));
    }

    const dialog = this.shadowRoot?.querySelector('.dialog-overview');
    if (dialog) {
      // @ts-ignore
      dialog.hide();
    }

    localStorage.setItem('firstTime', 'false');
  }

  render() {
    return html`
    <app-header @open-settings="${this.doOpenSettings}"></app-header>
    <sl-drawer label="Settings" class="settings-drawer">
      <app-settings @mode-changed="${() => this.modelChanged}" @theme-changed="${this.modelChanged}" @cloud-sync-changed="${this.cloudSyncChanged}"></app-settings>
    </sl-drawer>

    <sl-dialog no-header label="Hello" class="dialog-overview">
      <div id="intro-image-block">
        <img src="/assets/icons/maskable_icon_x512.png" alt="app icon" />
      </div>
      <div id="intro-content-block">
        <h1>Hello!</h1>
        <p>
          Meet Skipper, your all-in-one chat app for any device.
          Share your screen for instant help and have responses read back with lifelike voices.
          Skipper also supports speech-to-text and lets you generate images or check the weather and news.
          It's designed to make your life simpler, wherever you are.
        </p>

        <h3>Get Started</h3>

        <p>
            You have two options:
        </p>

        <ol>
          <li>Enter Your OpenAI Key: Gain access to advanced features and capabilities by entering your OpenAI key .
            <a href="https://www.howtogeek.com/885918/how-to-get-an-openai-api-key/">Click here to learn how to get an OpenAI Key</a>
          </li>

         ${this.gpuCheck ? html`<li>
            Use a Local AI Model: Start right away using a local AI model with limited functionality.
            Make your choice below to begin your journey!
          </li>` : null}
        </ol>

        <div id="intro-actions">
          <key-manager @keys-saved="${() => this.getStarted("cloud")}"></key-manager>
          ${this.gpuCheck ? html`
               <fluent-button appearance="accent" @click="${() => this.getStarted("local")}">Get Started with a Local AI Model</fluent-button>
            ` : null}
        </div>
      </div>
    </sl-dialog>

      <div>
        <main>
          ${router.render()
      }
        </main>
      </div>
    `;
  }
}
