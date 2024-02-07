import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { styles as sharedStyles } from '../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';

@customElement('app-convo')
export class AppConvo extends LitElement {
    @state() title = '';
    @state() text = '';

    static styles = [
        sharedStyles,
        css`
        main {
            margin-top: 36px;
            padding: 10px;
            height: calc(100vh - 46px);
        }

        .action-bar {
            padding-left: 8px;
            border-radius: 8px;
            backdrop-filter: blur(40px);
            font-size: 14px;
            /* position: fixed; */
            /* left: 0px; */
            /* right: 0px; */
            z-index: 9;
            margin-top: 38px;
            margin: 0;
            /* margin-top: 38px; */
            border-radius: 0px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #80808021;
            border-radius: 8px;
          }
    `
    ]

    constructor() {
        super();
    }

    firstUpdated() {
        // get title and text from query string
        const url = new URL(window.location.href);
        const title = url.searchParams.get('title');
        const text = url.searchParams.get('text');

        console.log("title: ", title);
        console.log("text: ", text);

        if (title && text) {
            this.title = title;
            this.text = text;
        }

    }

    render() {
        return html`
      <main>
        <div class="action-bar">
          <h2>${this.title}</h2>
        </div>

        <div .innerHTML="${this.text}"></div>
      </main>
    `;
    }
}
