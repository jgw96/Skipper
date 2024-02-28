import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import './pages/app-home';
import './components/header';
import './components/app-settings';
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

      @media(prefers-color-scheme: light) {
        sl-drawer::part(panel) {
          background: #ffffff57;
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

  render() {
    return html`
    <app-header @open-settings="${this.doOpenSettings}"></app-header>
    <sl-drawer label="Settings" class="settings-drawer">
      <app-settings @mode-changed="${() => this.modelChanged}" @theme-changed="${this.modelChanged}"></app-settings>
    </sl-drawer>

      <div>
        <main>
          ${router.render()
      }
        </main>
      </div>
    `;
  }
}
