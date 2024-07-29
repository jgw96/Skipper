import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { searchBing } from '../services/web-search';

@customElement('web-search')
export class WebSearch extends LitElement {

  @property({ type: String }) searchTerm: string | undefined;

  @state() webPages: any[] = [];

  static styles = [
    css`
            :host {
                display: block;
            }

            ul {
                list-style: none;
                padding: 0;
                display: flex;
                gap: 8px;
                flex-direction: column;
            }

            fluent-button, fluent-text-area, fluent-listbox, fluent-card {
                --accent-fill-rest: #8769dc;
                --accent-stroke-control-rest: #8769dc;
                --accent-fill-active: #8769dc;
                --accent-stroke-control-active: #8769dc;
                --accent-fill-hover: #8769dc;
                --accent-stroke-control-hover: #8769dc;
              }

              fluent-card {
                padding: 8px;
                padding-top: 0;
              }

              fluent-card a {
                color: #8769dc;
                text-decoration: none;

              }

                fluent-card h3 {
                    font-size: 16px;
                }

              fluent-card p {
                font-size: 12px;
              }

              @media(prefers-color-scheme: dark) {
                fluent-card {
                  background: rgba(255, 255, 255, 0.06);
                  border: none;
                  color: white;
                }
            }
        `
  ];

  async firstUpdated() {
    console.log("searchTerm", this.searchTerm)
    if (this.searchTerm) {
      const data = await searchBing(this.searchTerm);
      console.log("web-search", data);

      this.webPages = data.webPages.value;
    }
  }

  async attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    // console.log("name", name, "value", value)
    // super.attributeChangedCallback(name, _old, value);
    // if (name === 'search-term') {
    //   const data = await searchBing(this.searchTerm!);
    //   console.log(data);

    //   this.webPages = data.webPages.value;
    // }
  }

  render() {
    return html`
        <ul>
          ${this.webPages.map((page) => {
      return html`
                    <fluent-card>
                        <h3>${page.name}</h3>
                        <a href="${page.url}">${page.url}</a>
                        <p>${page.snippet}</p>
            </fluent-card>
                `;
    })
      }
          </ul>
        `;
  }
}
