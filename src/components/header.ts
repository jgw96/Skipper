import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import { fluentAnchor, provideFluentDesignSystem } from '@fluentui/web-components';
import { router } from '../router';

provideFluentDesignSystem().register(fluentAnchor());

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Skipper AI';

  @state() enableBack: boolean = false;

  static get styles() {
    return css`
      :host {
        --theme-color: transparent;
      }

      #pro-link {
        background: #ffffff0f;
      }

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

        position: unset;
        left: env(titlebar-area-x, 0);
        top: env(titlebar-area-y, 0);
        height: env(titlebar-area-height, 30px);
        width: calc(env(titlebar-area-width, 100%) - 18px);
        -webkit-app-region: drag;

        z-index: 1
      }

      app-login {
        margin-bottom: 3px;
      }

      #header-actions {
        display: flex;
        align-items: center;
        gap: 4px;

        animation: quickSlideFromRight 0.3s;
      }

      #home-icon {
        app-region: no-drag;
        cursor: pointer;
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
        font-size: 12px;
        font-weight: 500;
      }

      nav a {
        margin-left: 10px;
      }

      #back-button-block {
        display: flex;
        justify-content: space-between;
        align-items: center;

        width: max-content;
        gap: 12px;
      }

      #back-button-block img {
        height: 20px;
        border-radius: 50%;
        width: 20px;

        animation: quickSlideFromleft 0.3s;
      }

      #back-button-block fluent-anchor {
        animation: quickSlideFromleft 0.3s;
      }

      fluent-anchor::part(control) {
        margin-top: 0;
        padding-top: 0;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
          background: var(--theme-color);
        }

        nav a {
          color: initial;
        }

        fluent-anchor::part(control), fluent-button::part(control) {
          background: transparent;
          color: black;
        }

        fluent-anchor#pro-link {
          background: #E7E7E7;
        }
      }

      @media(prefers-color-scheme: dark) {
        header {
          /* color: white; */
          /* border-color: #2d2d2d1a; */
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        fluent-button img, fluent-anchor img {
          filter: invert(1);
        }

        fluent-anchor::part(control), fluent-button::part(control) {
          background: transparent;
          color: white;
        }

        #back-button-block fluent-anchor {
          background: #2d2d2d;
        }
      }

      @media(max-width: 680px) {
        header {
          background: transparent;
        }

        header h1 {
          display: none;
        }
      }


      @keyframes quickSlideFromleft {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }

      @keyframes quickSlideFromRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
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

  goHome() {
    router.navigate('/');
  }

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack ? html`<fluent-anchor href="/">
            Back
          </fluent-anchor>` : null}

          ${!this.enableBack ? html`
          <img @click="${this.goHome}" id="home-icon" src="/assets/icons/64-icon.png" alt="app icon">

          <h1>${this.title}</h1>

          `

        : null}
        </div>

        <div id="header-actions">

          <!-- add new notes button -->
           ${!this.enableBack ? html`<fluent-anchor id="pro-link" href="/pro">
              Get Skipper Pro
            </fluent-anchor>` : null}

          ${!this.enableBack ? html`
              <fluent-anchor href="/photo">
                <img src="/assets/image-outline.svg">
              </fluent-anchor>
              ` : null
      }
          ${!this.enableBack ? html`
              <fluent-anchor href="/voice">
                <img src="/assets/headset-outline.svg">
              </fluent-anchor>
              ` : null
      }
          <fluent-button @click="${this.openSettings}">
            <img src="/assets/settings-outline.svg">
          </fluent-button>
        </div>
      </header>
    `;
  }
}
