import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Document } from 'langchain/document';

import { fluentSearch, provideFluentDesignSystem } from '@fluentui/web-components';
provideFluentDesignSystem().register(fluentSearch());

@customElement('app-search')
export class AppSearch extends LitElement {
    @property({ type: Array }) savedConvos: any[] = [];

    @state() retrievalChain: any;
    @state() answer: string = "";

    static styles = [
        css`
            :host {
                display: block;
            }

            fluent-button,
            fluent-text-area,
            fluent-listbox,
            fluent-card,
            fluent-tooltip,
            fluent-search {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
            }

            fluent-search {
                --neutral-fill-input-rest: #2d2d2d;
                --neutral-fill-input-hover: #2d2d2d;
                --neutral-fill-input-active: #2d2d2d;
                --neutral-fill-input-focus: #2d2d2d;
                background: #2d2d2d;
                border: none;
                margin-bottom: 10px;

                border-radius: 8px;
            }

            fluent-search::part(root) {
                border: none;
                background: rgba(255, 255, 255, 0.06);
            }

            #dropdown {
                position: absolute;
                background: #272727;
                z-index: 2;
                padding: 8px;
                border-radius: 6px;
                font-size: 14px;
                width: 20vw;
                top: 45px;

                display: flex;
                flex-direction: column;
                gap: 15px;

                box-shadow: 0px 2px 20px #0000004a;
            }

            fluent-button::part(control) {
                background: #8769dc;
            }
        `
    ];

    // when this.savedConvos is updated, do an action
    async updated(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has('savedConvos')) {
            const docs: Document[] = [];

            this.savedConvos.forEach((convo) => {
                console.log("convo search", convo)
                const joinedContent = convo.content.map((content: any) => content.content).join(" ");
                const doc = new Document({ pageContent: joinedContent });
                docs.push(doc);
            });

            const { setupLoader } = await import("../services/search/tools");
            this.retrievalChain = await setupLoader(docs);
        }
    }

    async handleSearch(e: any) {
        const searchTerm = e.target.value;
        const result = await this.retrievalChain.invoke({
            input: searchTerm,
        });
        console.log(result);

        this.answer = result.answer;

        const fullContext = result.context[0].pageContent;
        await this.findInSavedConvos(fullContext);

        document.addEventListener('click', (e) => {
            if (!this.shadowRoot?.getElementById('dropdown')?.contains(e.target as Node)) {
                this.answer = "";
            }
        });
    }

    async findInSavedConvos(searchTerm: string) {
        const { getConversations } = await import('../services/storage');
        const savedConvos = await getConversations();

        const searchResults = savedConvos.filter((convo: any) => {
            const joinedContent = convo.content.map((content: any) => content.content).join(" ");
            return joinedContent.includes(searchTerm);
        });

        console.log("searchResults", searchResults);


    }

    render() {
        return html`
         <fluent-search @change="${this.handleSearch}"></fluent-search>

         ${this.answer && this.answer.length > 0 ? html`
              <div id="dropdown">
                <span>${this.answer}</span>

                <fluent-button>Open Chat</fluent-button>
              </div>
            ` : null
            }
        `;
    }
}
