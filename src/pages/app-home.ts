import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';

import { fluentButton, fluentTextField, fluentOption, fluentListbox, fluentCard, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton(), fluentTextField(), fluentOption(), fluentListbox(), fluentCard());

import { styles } from '../styles/shared-styles';
import { makeAIRequest } from '../services/ai';
import { deleteConversation, getConversations, saveConversation } from '../services/storage';
import { router } from '../router';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() previousMessages: any[] = [];
  @state() convoName: string | undefined;

  @state() savedConvos: any[] = [];

  @state() loading = false;

  @state() currentPhoto: string | undefined;

  captureStream: any;

  static get styles() {
    return [
      styles,
      css`
        fluent-button, fluent-text-field, fluent-listbox, fluent-card {
          --accent-fill-rest: #8c6ee0;
          --accent-stroke-control-rest: #8c6ee0;
          --accent-fill-active: #8c6ee0;
          --accent-stroke-control-active: #8c6ee0;
          --accent-fill-hover: #8c6ee0;
          --accent-stroke-control-hover: #8c6ee0;
        }

        .title-bar {
          display: flex;
          flex-direction: column-reverse;
        }

        #input-inner img {
          object-fit: contain;
          animation: quickup 0.3s ease;
        }

        #saved fluent-card .title-bar .date-display, #mobileSaved fluent-card .title-bar .date-display {
          font-size: 10px;
          color: #cccccc;
        }

        #suggested {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 62%;
          padding: 0;
          margin: 0;
        }

        .system ul {
          padding: 0;
          margin: 0;
          list-style: initial;
        }

        .system p {
          padding: 0;
          margin: 0;
        }

        #suggested li {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #ffffff0f;
          font-size: 14px;
          cursor: pointer;
          min-height: 50px;
        }

        fluent-card {
          animation: quickup 0.3s ease;
        }

        #extra-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #extra-actions fluent-button::part(control) {
          background: transparent;
          border: none;
        }

        #input-block #extra-actions fluent-button {
          height: unset;
        }

        #input-block #extra-actions fluent-button img {
          width: 20px;
          height: 20px;
        }

        fluent-card {
          cursor: pointer;
        }

        #new-convo {
          width: 18.5vw;
        }

        #input-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-saved::part(body) {
          padding: 8px;
        }

        ul {
          list-style: none;
          margin: 0;


          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0;

          // padding-bottom: 80px;
          padding-left: 10px;

          overflow: scroll;
        }

        #toolbar {
          height: 3em;
          margin-top: 0;

          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;

          bottom: 0;
          top: initial;
          position: fixed;

          animation: quickup 0.3s ease;
        }



        #convo-name {
          padding: 8px;
          border-radius: 8px;
          backdrop-filter: blur(40px);
          font-size: 14px;

          position: fixed;
          left: 0px;
          right: 0px;
          z-index: 9;
          margin-top: 38px;
          margin: 0;
          margin-top: 38px;
          border-radius: 0px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #convo-name fluent-button::part(control) {
          background: transparent;
          border: none;
        }

        #mainBlock {
          display: grid;
          overflow: hidden;
        }


        #convo-name h2 {
          margin: 0;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow-x: hidden;
          max-width: 80vw;
        }

        .action-bar {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .delete-button {
          place-self: flex-end;
        }

        .delete-button::part(base) {
          background: transparent;
        }

        .copy-button::part(base) {
          background: transparent;
          border: none;
        }

        .delete-button img {
          width: 12px;
          height: 12px;
        }

        fluent-listbox {
          border: none;
          outline: none;
          display: flex;
          gap: 6px;
          position: sticky;
          top: 50px;
        }

        ul::-webkit-scrollbar {
          width: 0px;
        }

        fluent-card {
          display: flex;
          flex-direction: column;
          padding: 8px;

          height: 104px;

          justify-content: space-between;
          padding-top: 18px;
        }

        fluent-card fluent-button {
          place-self: flex-end;
        }

        .item-toolbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-bottom: 4px;
          display: flex;
        }

        .content-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .content-bar img {
          border-radius: 8px;
        }


        main {
          display: grid;
          grid-template-columns: 20vw 80vw;
        }

        #saved {
          /* color: white; */
          background-color: #232734db;
          /* border-color: #2d2d2d1a; */
          backdrop-filter: blur(40px);
          padding: 8px;
          animation: slideStart 0.3s ease;
          contain: strict;
        }

        @keyframes slideStart {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        #convo-list {
          width: 97%;
          height: 77vh;
          padding-top: 53px;
          contain: strict;
        }

        #mainBlock > div {
          height: 96vh;
        }

        #saved fluent-card span, #mobileSaved fluent-card span {
          max-width: 82%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;

          margin-bottom: 10px;
          font-size: 14px;
        }

        #mobile-menu {
          // position: fixed;
          // bottom: 100px;
          // right: 16px;

          z-index: 2;
        }

        // #mobile-menu::part(control) {
        //   border-radius: 50%;
        //   height: 64px;
        //   width: 64px;
        // }

        #mobile-menu::part(label) {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #mobile-menu img {
          height: 26px;
        }

        .copy-button img {
          height: 12px;
        }

        fluent-text-field::part(root) {
          height: 2.8em;
        }

        #input-block {
          display: flex;
          flex-direction: column;

          animation: quickup 0.3s ease;
        }

        #input-block fluent-button {
          height: 2.8em;
        }

        li {
          padding: 8px;
          border-radius: 6px;

          animation: quickup 0.3s ease;
        }

        li.user {
          align-self: flex-end;
          background: #8c6ee0;
          margin-left: 10vw;
        }

        li.user sl-button {
          border-color: white;
        }

        li.system {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.06);
          margin-right: 10vw;
        }

        #saved li {
          background: rgba(255, 255, 255, 0.17);
          min-height: 2em;

          display: flex;
          align-items: center;
          cursor: pointer;
        }

        #saved fluent-text-field {
          margin-bottom: 8px;
          flex: 1;
        }

        #saved ul {


          padding: 0px;
    height: 89vh;
    overflow: hidden auto;
    position: sticky;
    top: 38px;
        }

        #input-block {
          position: fixed;
          bottom: 8px;
          left: 25vw;
          right: 8px;
          padding: 8px;
          background: #ffffff0f;
          display: flex;
          justify-content: space-between;

          gap: 8px;

          backdrop-filter: blur(40px);
          border-radius: 6px;
        }

        #input-block fluent-text-field {
          flex: 1;
        }

        #input-block fluent-button img {
          width: 24px;
          height: 24px;
          margin-top: 6px;
        }

        #input-block fluent-button::part(label) {
          align-items: center;
          justify-content: center;
          display: flex;
        }

        #no-messages {
          display: flex;
          align-items: center;
          justify-content: center;

          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          margin-top: 10vh;
        }

        #no-messages img {
          width: 260px;
          height: 260px;
          border-radius: 50%;

          animation: fadein 0.8s ease;
        }

        #no-messages p {
          font-weight: bold;
        }

        @media(prefers-color-scheme: dark) {
          fluent-text-field::part(root) {
            background: #232734db;
            color: white;
            backdrop-filter: blur(40px);
          }

          fluent-card {
            background: rgba(255, 255, 255, 0.06);
            color: white;
            border: none;
          }

          fluent-card fluent-button::part(control) {
            background: rgba(255, 255, 255, 0.06);
            color: white;
            border: none;
          }

          fluent-card fluent-button {
            margin-top: 8px;
          }
        }

        @media(prefers-color-scheme: light) {
          li.system {
            background: white;
          }

          #suggested li {
            background: white;
          }

          fluent-card {
            background: #eaeaea;
          }

          .delete-button::part(base) {
            background: #c4c4c4;
          }

          li.user {
            color: white;
          }

          #saved {
            background: white;
          }

          #mobile-menu::part(base) {
            background: rgba(0, 0, 0, 0.17);
          }

          #input-block {
            background: rgb(0 0 0 / 17%);
          }

          #saved li {
            background: white;
          }

          .copy-button::part(base) {
            background: transparent;
          }
        }

        #mobile-menu {
          display: none;
        }

        @media(min-width: 860px) {
          #convo-name {
            left: 20vw;
            top: 31px;
            right: 0px;
            margin-top: 0;
          }
        }

        sl-drawer::part(footer) {
          padding-right: 30px;
        }

        @media(max-width: 860px) {
          #saved {
            display: none;
          }

          main {
            display: unset;
          }

          #convo-list {
            height: 76vh;
            width: unset;
            padding-top: 97px;
          }

          #convo-name {
            margin-top: 37px;
          }

          #mobile-menu {
            display: block;
          }

          #mainBlock {
            grid-template-columns: 1fr;
          }

          ul {
            padding: 6px;
          }

          #input-block {
            left: 0px;
            right: 0px;
            bottom: 0px;
            border-radius: 0px;
          }

          #mobileSaved li {
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.24);
            padding: 16px;
          }

          #mobileSaved {
            padding-bottom: 0;
          }

          #suggested {
            width: 82%;
          }
        }

        @media(max-width: 860px) and (min-height: 910px) {
          #convo-list {
            height: 80vh;
          }
        }

        @keyframes quickup {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadein {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
    `];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');

    this.savedConvos = await getConversations();

    // set up enter key to send message
    const input: any = this.shadowRoot?.querySelector('fluent-text-field');
    input.addEventListener("keyup", (event: any) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.send();
      }
    });
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  async shareConvo(name: string, convo: Array<any>) {
    const text = convo.map((message) => message.content).join(" ");
    // remove name from text
    const index = text.indexOf(name);
    if (index === -1) {
      return;
    }

    const textWithoutName = text.slice(index + name.length, text.length);

    const shareURL = `/convo?title=${name}&text=${textWithoutName}`;

    await navigator.share({
      title: name,
      text: textWithoutName,
      url: shareURL
    });
  }

  preDefinedChat(chat: string) {
    const input: any = this.shadowRoot?.querySelector('fluent-text-field');
    input.value = chat;

    this.send();
  }

  async addImageToConvo(base64data?: string | undefined) {
    if (base64data) {
      this.currentPhoto = base64data;
      return;
    }

    const { fileOpen } = await import('browser-fs-access');

    const blob = await fileOpen({
      mimeTypes: ['image/*'],
    });

    let blobFromFile = undefined;

    if (blob.handle) {
      blobFromFile = await blob.handle.getFile();
    }
    else {
      blobFromFile = blob;
    }

    // turn blobFromFile to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      this.currentPhoto = base64data as string;
    }

    reader.readAsDataURL(blobFromFile);
  }

  async send() {
    const input: any = this.shadowRoot?.querySelector('fluent-text-field');
    const inputValue = input?.value;
    const list = this.shadowRoot?.querySelector('ul');

    if (this.previousMessages.length === 0) {
      console.log("doign title request")
      // first coupe of words of inputValue
      const convoName = inputValue?.split(" ").slice(0, 8).join(" ");
      console.log('convoName', convoName)
      this.convoName = convoName;
    }

    if (input) {
      this.loading = true;

      input.value = "";

      this.previousMessages = [
        ...this.previousMessages,
        {
          role: "user",
          content: inputValue,
          image: this.currentPhoto
        }
      ]

      // const data = await requestGPT(inputValue as string)
      // console.log("home data", data)
      const data = await makeAIRequest(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

      this.previousMessages = [
        ...this.previousMessages,
        {
          role: "system",
          content: data.choices[0].message.content,
        }
      ]

      this.loading = false;

      if (this.previousMessages.length > 1) {
        console.log("look here", this.convoName, this.previousMessages)
        await saveConversation(this.convoName as string, this.previousMessages);

        this.savedConvos = await getConversations();
      }

      // get last element of list
      this.handleScroll(list);

    }
  }

  private handleScroll(list: HTMLUListElement | null | undefined) {
    const lastElement = list?.lastElementChild;
    // scroll to the bottom of the last element
    lastElement?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  async startConvo(convo: any) {
    this.previousMessages = [];

    console.log("convoContent", convo.content)

    if (convo.content[0].image && convo.content[0].image.length > 0) {
      this.currentPhoto = convo.content[0].image;
    }
    else {
      this.currentPhoto = "";
    }

    this.previousMessages = convo.content;
    this.convoName = convo.name;

    await this.updated;

    this.handleScroll(this.shadowRoot?.querySelector('#convo-list'))

    const drawer: any = this.shadowRoot?.querySelector('.mobile-saved');
    await drawer?.hide();
  }

  async newConvo() {
    this.previousMessages = [];
    this.convoName = undefined;
    this.currentPhoto = "";

    await this.updated;

    this.handleScroll(this.shadowRoot?.querySelector('#convo-list'))

    const drawer: any = this.shadowRoot?.querySelector('.mobile-saved');
    await drawer?.hide();
  }

  async openMobileDrawer() {
    const drawer: any = this.shadowRoot?.querySelector('.mobile-saved');
    await drawer?.show();
  }

  async copyButton(content: string) {
    await navigator.clipboard.writeText(content);
  }

  async shareButton(content: string) {
    await navigator.share({
      title: 'GPT4-chat',
      text: content,
      url: ''
    });
  }

  async deleteConvo(convo: any) {
    await deleteConversation(convo.name);

    this.savedConvos = await getConversations();
  }

  render() {
    return html`
      <!-- <app-header></app-header> -->

      <sl-drawer class="mobile-saved" placement="bottom" has-header label="Saved Conversations">
        <div>
        ${this.savedConvos.length > 0 ? html`
          <ul id="mobileSaved">
            ${this.savedConvos.map((convo) => {
      return html`<fluent-card @click="${() => this.startConvo(convo)}">
      <div class="title-bar">
        <span>${convo.name}</span>

        <span class="date-display">${new Date(convo.date).toLocaleDateString()}</span>
      </div>

      <div class="action-bar">
        <sl-button circle size="small" @click="${() => this.deleteConvo(convo)}" class="delete-button">
          <img src="/assets/trash-outline.svg" alt="delete" />
        </sl-button>
      </div>
    </fluent-card>`
    }
    )}
          </ul>
          ` : html`
          <div id="no-messages">
            <p>No saved conversations</p>
          </div>
          `
      }
       </div>

       <fluent-button slot="footer" id="new-convo" size="small" appearance="accent" @click="${() => this.newConvo()}">New Chat</fluent-button>
      </sl-drawer>

      <main>

      <div id="saved">
        ${this.savedConvos.length > 0 ? html`
          <ul>
            ${this.savedConvos.map((convo) => {
        return html`<fluent-card @click="${() => this.startConvo(convo)}">
          <div class="title-bar">
            <span>${convo.name}</span>

            <span class="date-display">${new Date(convo.date).toLocaleDateString()}</span>
          </div>

          <div class="action-bar">
            <sl-button circle size="small" @click="${() => this.deleteConvo(convo)}" class="delete-button">
              <img src="/assets/trash-outline.svg" alt="delete" />
            </sl-button>
          </div>
        </fluent-card>`
      }
      )}
      </ul>
    </div>

<div id="toolbar">
      <fluent-button id="new-convo" size="small" appearance="accent" @click="${() => this.newConvo()}">New Chat</fluent-button>
      </div>
          </ul>
          ` : html`
          <div id="no-messages">
            <p>No saved chats</p>
          </div>
          `
      }
       </div>

      <div id="mainBlock">

       <div>

       ${this.previousMessages.length > 0 ? html`
       <div id="convo-name">
        <h2>${this.convoName}</h2>

          <div class="action-bar">
            <fluent-button circle @click="${() => this.shareConvo(this.convoName || "", this.previousMessages)}" class="copy-button">
              <img src="/assets/share-social-outline.svg" alt="share" />
            </fluent-button>
          </div>
       </div>
       <ul id="convo-list">
        ${this.previousMessages.map((message) => {
        return html`<li class="${message.role}">
          <div class="item-toolbar">
              <sl-button @click="${() => this.shareButton(message.content)}" circle size="small" class="copy-button">
                <img src="/assets/share-social-outline.svg" alt="share" />
              </sl-button>

              <sl-button @click="${() => this.copyButton(message.content)}" circle size="small" class="copy-button">
                <img src="/assets/copy-outline.svg" alt="copy" />
              </sl-button>
          </div>

          <div class="content-bar">
            ${message.image ? html`<img src="${message.image}" alt="photo" width="100" height="100" />` : html``}
            <div .innerHTML="${message.content}"></div>
          </div>
        </li>`
      })
        }
       </ul>

       ` : html`
          <div id="no-messages">
            <img src="/assets/icons/maskable_icon_x512.png" alt="chat" />
            <p>Start a new chat </p>

            <ul id="suggested">
              <li @click="${() => this.preDefinedChat("Why is the sky blue?")}">Why is the sky blue?</li>
              <li @click="${() => this.preDefinedChat("Write a poem about the ocean")}">Write a poem about the ocean</li>
              <li @click="${() => this.preDefinedChat("Write some JavaScript code to make a request to an api")}">Write some JavaScript code to make a request to an api</li>
              <li @click="${() => this.preDefinedChat("Give me a recipe for a chocolate cake")}">Give me a recipe for a chocolate cake</li>
            </ul>
          </div>
       `}

       <div id="input-block">
        <div id="extra-actions">
          <fluent-button @click="${() => this.addImageToConvo()}" size="small">
            <img src="/assets/image-outline.svg" alt="image icon">
          </fluent-button>

          <fluent-button appearance="accent" @click="${() => this.openMobileDrawer()}" size="large" circle id="mobile-menu">
            <img src="assets/menu-outline.svg" alt="menu" />
          </fluent-button>
        </div>
        <div id="input-inner">
          ${this.currentPhoto ? html`<img src="${this.currentPhoto}" alt="photo" width="40" height="40" />` : html``}

          <fluent-text-field placeholder="Enter your message"></fluent-text-field>

          <fluent-button ?loading="${this.loading}" ?disabled="${this.loading}" appearance="accent" type="primary" @click=${this.send}>
            <img src="/assets/send-outline.svg" alt="send" />
          </fluent-button>
        </div>
    </div>
      </div>
      </div>
      </main>
    `;
  }
}
