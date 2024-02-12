import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';


import { fluentAnchor, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentAnchor());

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'gpt-client';

  @state() enableBack: boolean = false;

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        height: 4em;

        /* color: white; */
        // background-color: #232734db;
        // /* border-color: #2d2d2d1a; */
        // backdrop-filter: blur(40px);

        background: var(--theme-color);

        padding-left: 10px;
        padding-right: 10px;

        position: fixed;
        left: env(titlebar-area-x, 0);
        top: env(titlebar-area-y, 0);
        height: env(titlebar-area-height, 30px);
        width: calc(env(titlebar-area-width, 100%) - 18px);
        -webkit-app-region: drag;

        z-index: 1
      }

      fluent-button img, fluent-anchor img {
        height: 20px;
        width: 20px;

        padding-top: 4px;
      }

      fluent-button, fluent-text-field, fluent-listbox, fluent-card, fluent-anchor {
          --accent-fill-rest: #5e11fd;
          --accent-stroke-control-rest: #5e11fd;

          app-region: no-drag;
        }

      fluent-anchor::part(control) {
        background: #ffffff0f;
        color: white;
      }

      #actions img {
        height: 20px;
      }

      #actions fluent-button::part(control), #actions fluent-anchor::part(control){
        background: transparent;
        border: none;
      }

      fluent-button, fluent-anchor {
        height: 25px;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 16px;
        font-weight: bold;
      }

      nav a {
        margin-left: 10px;
      }

      #back-button-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 12em;
      }

      #back-button-block img {
        height: 20px;
        border-radius: 50%;
        width: 20px;
      }

      fluent-anchor::part(control) {
        margin-top: 0;
        padding-top: 0;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }

        nav a {
          color: initial;
        }

        fluent-anchor::part(control), fluent-button::part(control) {
          background: #cecece;
        }
      }

      @media(prefers-color-scheme: dark) {
        header {
          /* color: white; */
          /* border-color: #2d2d2d1a; */
          backdrop-filter: blur(40px);
        }

        fluent-anchor::part(control), fluent-button::part(control) {
          background: #343743;
          color: white;
        }
      }

    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const { router } = await import('../router');
    // @ts-ignore
    router.addEventListener('route-changed', ({ context }) => {
      console.log("route changed", context)

      if (context.url.pathname !== "/") {
        this.enableBack = true;
      }
      else {
        this.enableBack = false;
      }

      console.log("enable back", this.enableBack)
    });
    // this.enableBack = true;
  }

  openSettings() {
    // fire a custom event
    this.dispatchEvent(new CustomEvent('open-settings', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack ? html`<fluent-anchor href="/">
            Back
          </fluent-anchor>` : null}

          ${!this.enableBack ? html`
          <img src="/assets/icons/maskable_icon_x48.png" alt="app icon">` : null}
        </div>

        <div>
          <fluent-anchor href="/voice">
            <img src="/assets/headset-outline.svg">
          </fluent-anchor>
          <fluent-button @click="${this.openSettings}">
            <img src="/assets/settings-outline.svg">
          </fluent-button>
        </div>
      </header>
    `;
  }
}
