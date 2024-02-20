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
      main {

      }

      sl-drawer::part(panel) {
        backdrop-filter: blur(40px);
        padding-top: env(titlebar-area-height, initial);
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

  render() {
    return html`
    <app-header @open-settings="${this.doOpenSettings}"></app-header>
    <sl-drawer label="Settings" class="settings-drawer">
      <app-settings></app-settings>
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
