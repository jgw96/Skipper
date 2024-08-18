import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js'

@customElement('app-update')
export class AppUpdate extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    update() {
        // emit an event on window
        window.dispatchEvent(new CustomEvent('update-app'));
    }

    render() {
        return html`
            <button @click=${this.update}>Reload to Update</button>
        `;
    }
}
