import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import './pages/app-home';
import './components/header';
import './components/app-settings';
import './components/key-manager';
import './styles/global.css';
import { router } from './router';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
      sl-drawer::part(panel) {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        padding-top: env(titlebar-area-height, initial);
        background: #20202040;
      }

      fluent-button, fluent-text-area, fluent-listbox, fluent-card, fluent-tooltip {
        --accent-fill-rest: #8c6ee0;
        --accent-stroke-control-rest: #8c6ee0;
        --accent-fill-active: #8c6ee0;
        --accent-stroke-control-active: #8c6ee0;
        --accent-fill-hover: #8c6ee0;
        --accent-stroke-control-hover: #8c6ee0;
      }

      #intro-image-block {
        height: 32em;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #8c6ee0;
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

      .dialog-overview::part(body) {
        padding: 0;
      }

      @media(prefers-color-scheme: light) {
        sl-drawer::part(panel) {
          background: var(--theme-color);
        }

        .dialog-overview {
          --sl-panel-background-color: #ffffff40;
        }

        sl-drawer::part(title) {
          color: white;
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
          width: 49vw;
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
      appHome.handleModelChange($event.detail.model);
    }
  }

  getStarted() {
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
      <app-settings @mode-changed="${() => this.modelChanged}" @theme-changed="${this.modelChanged}"></app-settings>
    </sl-drawer>

    <sl-dialog no-header label="Hello" class="dialog-overview">
      <div id="intro-image-block">
        <img src="/assets/icons/maskable_icon_x512.png" alt="app icon" />
      </div>
      <div id="intro-content-block">
        <h1>Hello!</h1>
        <p>
          Skipper is a multi-modal, multi-model AI assistant. Skipper can work with you how you want. Want to interact with your voice? You can. Need Skipper to see something? Give it an image! Simply want text chat? That works too. Want to chat with OpenAI's GPT-4? Or Google's Gemini Pro? Or, want to chat with a model that runs locally on your device? You can do that too. Skipper is designed to be flexible and work with you.
        </p>

        <p>
          To get started, you need to set up your API keys for the cloud models we support, OpenAI GPT4-Turbo and Google Gemini Pro.
          Check <a href="https://www.howtogeek.com/885918/how-to-get-an-openai-api-key/">here to learn how to get an OpenAI Key</a> and <a href="https://aistudio.google.com/app/apikey">here to get a Google Gemini Pro key</a>.
          Once you have your keys, enter them below, and then click Save.
          Note, you must supply a key for atleast one cloud based model to use Skipper.
        </p>
        <key-manager @keys-saved="${() => this.getStarted()}"></key-manager>
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
