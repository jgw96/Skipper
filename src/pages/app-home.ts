import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';

import { fluentButton, fluentTextArea, fluentOption, fluentListbox, fluentCard, fluentSearch, fluentMenu, fluentMenuItem, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton(), fluentTextArea(), fluentOption(), fluentListbox(), fluentCard(), fluentSearch(), fluentMenu(), fluentMenuItem());

import { styles } from '../styles/shared-styles';

import "../components/app-dictate";
import "../components/right-click";
import "../components/web-search";
import { chosenModelShipper, makeAIRequestStreaming } from '../services/ai';
import { getConversations } from '../services/storage';

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
  modelShipper: string = "";

  static get styles() {
    return [
      styles,
      css`
        fluent-button, fluent-text-area, fluent-listbox, fluent-card {
          --accent-fill-rest: #8c6ee0;
          --accent-stroke-control-rest: #8c6ee0;
          --accent-fill-active: #8c6ee0;
          --accent-stroke-control-active: #8c6ee0;
          --accent-fill-hover: #8c6ee0;
          --accent-stroke-control-hover: #8c6ee0;
        }

        sl-drawer::part(panel) {
          backdrop-filter: blur(40px);
        }

        sl-drawer::part(body) {
          padding-top: 0;
        }

        fluent-menu {
          background: #ffffff14;
          backdrop-filter: blur(48px);
          color: white;
          z-index: 99;
        }

        fluent-menu-item {
          color: white;
        }

        fluent-menu-item {
          --neutral-fill-stealth-hover: #181818;
        }

        .mobile-saved {
          --size: 40rem;
        }

        .mobile-saved::part(panel) {
          backdrop-filter: blur(40px);
          border-radius: 12px 12px 0px 0px;
        }

        fluent-search {
          width: -webkit-fill-available;
        }

        .mobile-saved fluent-search {
          width: 100%;
        }

        .mobile-saved fluent-search::part(root) {
          height: 3em;
        }

        #inner-extra-actions {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title-bar {
          display: flex;
          flex-direction: column-reverse;
        }

        #input-inner img {
          object-fit: contain;
          animation: quickup 0.3s ease;
          border-radius: 8px;
        }

        #saved fluent-card .title-bar .date-display, .mobile-saved #mobileSaved fluent-card .title-bar span.date-display {
          font-size: 10px;
        }

        #suggested {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 420px;
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
          border: none;
        }

        #extra-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #extra-actions fluent-button::part(control) {
          background: transparent;
          border: none;
          color: white;
        }


        #input-block #extra-actions fluent-button img {
          width: 20px;
          height: 20px;
        }

        #input-block.drag-over {
          background: #8c6ee042;
        }

        fluent-card {
          cursor: pointer;
        }

        #new-convo {
          width: 100%;
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
          width: -webkit-fill-available;

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
          gap: 4px;
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
          background-color: var(--theme-color);
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
          height: 73vh;
          padding-top: 53px;
          contain: strict;
        }

        #convo-list code {
          display: block;
          padding: 8px;
          background: #272b38;
          border-radius: 8px;
          margin: 10px;
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

        fluent-text-area {
          border-radius: 8px;
        }

        fluent-text-area::part(root) {
          height: 2.8em;
        }

        #input-block {
          display: flex;
          flex-direction: column;

          animation: quickup 0.3s ease;
        }

        #input-block fluent-button {
          height: 2.8em;
          align-self: end;
          margin-bottom: 1px;
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

        #saved fluent-text-area {
          margin-bottom: 8px;
          flex: 1;
        }

        #saved ul {
          padding: 0px;
          height: 83vh;
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

        #input-block fluent-text-area {
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
          width: 220px;
          height: 220px;
          border-radius: 50%;

          animation: fadein 0.8s ease;

          display: none;
        }

        #no-messages.main-content p {
          font-weight: bold;
          font-size: 38px;
          width: 420px;

          color: #8c6ee0;
          font-size: 54px;
          margin-top: 0;
          text-wrap: pretty;

          text-shadow: #8c6ee082 2px 2px;
        }

        @media(prefers-color-scheme: dark) {
          fluent-text-area::part(root) {
            background: var(--theme-color);
            color: white;
            backdrop-filter: blur(40px);
          }

          fluent-card {
            background: rgba(255, 255, 255, 0.06);
            border: none;
          }

          fluent-card fluent-button::part(control) {
            background: rgba(255, 255, 255, 0.06);
            border: none;
          }

          fluent-card fluent-button {
            margin-top: 8px;
          }
        }

        @media(prefers-color-scheme: light) {
          li.system {
            background: var(--theme-color);
          }

          fluent-menu-item {
            color: black;
            --neutral-fill-stealth-hover: white;
          }

          fluent-menu {
            background: rgb(235 235 235);
            backdrop-filter: none;
          }

          #convo-list code {
            background: #eaeaea;
          }

          #saved fluent-card .title-bar .date-display, #mobileSaved fluent-card .title-bar {

          }

          #suggested li {
            background: var(--theme-color);
          }

          fluent-card {
            background: white;
          }

          .delete-button::part(base) {
            background: #c4c4c4;
          }

          li.user {
            color: white;
          }

          #saved {
            background: var(--theme-color);
          }

          #mobile-menu::part(base) {
            background: rgba(0, 0, 0, 0.17);
          }

          #input-block {
            background: #8c6ee073;
          }

          #saved li {
            background: var(--theme-color);
          }

          li.system .copy-button::part(base) {
            background: #c4c4c4;
          }
        }

        #mobile-menu {
          display: none;
        }

        @media(min-width: 860px) {
          #convo-name {
            left: 20vw;
            top: 29px;
            right: 0px;
            margin-top: 0;
          }

          li.user, li.system {
            max-width: 45vw;
          }

          #saved ul {
            height: 84vh;
          }
        }

        @media(min-width: 1200px) {
          #saved ul {
            height: 85vh;
          }
        }

        @media(max-width: 860px) {
          #saved {
            display: none;
          }

          #no-messages.main-content p {
            width: 82%;
          }

          main {
            display: unset;
          }

          #convo-list {
            height: 74vh;
            width: unset;
            padding-top: 97px;
          }

          #convo-name {
            margin-top: 30px;
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
            left: 10px;
            right: 10px;
            bottom: 10px;
            border-radius: 8px;
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
            height: 74vh;
          }
        }

        @media(min-height: 1000px) {
          #convo-list {
            height: 79vh;
          }
        }

        @media (max-height: 420px) and (orientation: landscape){
          #convo-list {
            height: 50vh;
          }

          #saved ul {
            height: 79vh;
          }

          #no-messages {
            flex-direction: row;
          }

          #no-messages img {
            width: 170px;
            height: 170px;
          }

          #suggested {
            width: 50%;
          }
        }

        @media(max-height: 670px) {
          #no-messages img {
            width: 170px;
            height: 170px;
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
    setTimeout(async () => {
      if ((window as any).shareTargetFile) {
        const sharedFile = (window as any).shareTargetFile;

        console.log("sharedFile blob image", (window as any).shareTargetFile);

        if (sharedFile) {
          // this.recorded = file;
          console.log("file", sharedFile);

          const reader = new FileReader();
          reader.onload = (e) => {
            const base64data = e.target?.result;
            this.addImageToConvo(base64data as string);
          }

          reader.readAsDataURL(sharedFile);
        }
      }
    }, 800);

    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    const { getConversations } = await import('../services/storage');

    this.savedConvos = await getConversations();

    this.modelShipper = chosenModelShipper;

    // set up enter key to send message
    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.addEventListener("keyup", (event: any) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.send();
      }
    });

    this.addImageWithDragDrop();
  }

  addImageWithDragDrop() {
    if (this.modelShipper !== "google") {
      const dropElement: HTMLDivElement | null | undefined = this.shadowRoot?.querySelector('#input-block');

      dropElement?.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropElement.classList.add("drag-over");
      });

      dropElement?.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dropElement.classList.remove("drag-over");
      });

      dropElement?.addEventListener('drop', (event) => {
        event.preventDefault();
        dropElement.classList.remove("drag-over");

        const dt = event.dataTransfer;
        const files = dt!.files;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64data = e.target?.result;
          this.addImageToConvo(base64data as string);
        }

        reader.readAsDataURL(files[0]);
      });
    }
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
    console.log("sharing convo", name, convo)
    const text = convo.map((message) => message.content).join(" ");

    const shareURL = `/convo?title=${name}&text=${text}`;

    await navigator.share({
      title: name,
      text: text,
      url: shareURL
    });
  }

  preDefinedChat(chat: string) {
    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
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

  async send(): Promise<void> {
    return new Promise(async (resolve): Promise<void> => {

      const input: any = this.shadowRoot?.querySelector('fluent-text-area');
      const inputValue = input?.value;
      const list = this.shadowRoot?.querySelector('ul');

      console.log("this.currentPhoto", this.currentPhoto)

      const modelShipper = chosenModelShipper;

      if (this.previousMessages.length === 0) {
        console.log("doign title request")
        // first coupe of words of inputValue
        const convoName = inputValue?.split(" ").slice(0, 8).join(" ");
        console.log('convoName', convoName)
        this.convoName = convoName;
      }

      // remove newline character from inputValue
      const prompt = inputValue?.replace(/\n/g, " ");

      if (input && inputValue && prompt) {
        let streamedContent = "";

        this.loading = true;

        input.value = "";

        this.previousMessages = [
          ...this.previousMessages,
          {
            role: "user",
            content: prompt,
            image: this.currentPhoto
          }
        ]

        if (modelShipper === "google") {
          const { makeAIRequestWithGemini } = await import('../services/ai');
          const data = await makeAIRequestWithGemini(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "system",
              content: data.choices[0].message.content,
              // content: data
            }
          ];

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos)

            resolve();
          }
        }
        else if (this.currentPhoto) {
          const { makeAIRequest } = await import('../services/ai');
          const data = await makeAIRequest(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "system",
              content: data.choices[0].message.content,
              // content: data
            }
          ];

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos)

            resolve();
          }

          resolve();
        }
        else if (modelShipper === "redpajama") {
          const { loadChatModule } = await import('../services/local-ai');

          await loadChatModule();

          const { requestLocalAI } = await import('../services/local-ai');

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "system",
              // content: data.choices[0].message.content,
              content: ""
            }
          ]

          /*const response = */await requestLocalAI(prompt as string, (event: any, string: string) => {
            console.log('event', event, string);

            streamedContent += string;

            if (streamedContent && streamedContent.length > 0) {

              this.previousMessages[this.previousMessages.length - 1].content = string;

              this.previousMessages = this.previousMessages;

              this.requestUpdate();
            }
          });

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos)

            resolve();
          }
        }
        else {
          const evtSource = await makeAIRequestStreaming(this.currentPhoto ? this.currentPhoto : "", prompt as string, this.previousMessages);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "system",
              // content: data.choices[0].message.content,
              content: ""
            }
          ]

          evtSource.onmessage = async (event) => {
            console.log('event', event);

            const data = JSON.parse(event.data);
            console.log('data', data);

            // close evtSource if the response is complete
            if (data.choices[0].finish_reason !== null) {
              console.log("data stream closed");

              evtSource.close();

              streamedContent = "";

              window.requestIdleCallback(async () => {
                if (this.previousMessages.length > 1) {
                  const goodMessages = this.previousMessages;

                  const { saveConversation } = await import('../services/storage');
                  await saveConversation(this.convoName as string, goodMessages);

                  const { getConversations } = await import('../services/storage');
                  this.savedConvos = await getConversations();

                  console.log("this.savedConvos", this.savedConvos)
                }


              }, { timeout: 1000 });

              resolve();
            }

            // continuously add to the last message in this.previousMessages
            // this.previousMessages[this.previousMessages.length - 1].content += data.choices[0].delta.content;

            if (data.choices[0].delta.content && data.choices[0].delta.content.length > 0) {
              streamedContent += data.choices[0].delta.content;

              if (streamedContent && streamedContent.length > 0) {

                this.previousMessages[this.previousMessages.length - 1].content = streamedContent;

                this.previousMessages = this.previousMessages;

                this.requestUpdate();
              }
            }
          }
        }


        this.loading = false;

        this.handleScroll(list);

      }
    });
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
    this.convoName = undefined;
    await this.requestUpdate();

    this.convoName = convo.name;
    await this.requestUpdate();

    await this.updated;

    this.handleScroll(this.shadowRoot?.querySelector('#convo-list'))

    const drawer: any = this.shadowRoot?.querySelector('.mobile-saved');
    await drawer?.hide();
  }

  async newConvo() {
    this.previousMessages = [];
    this.convoName = undefined;
    this.currentPhoto = "";

    if(this.modelShipper === "redpajama") {
      const { resetLocal } = await import('../services/local-ai');
      await resetLocal();
    }

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
    const { deleteConversation } = await import('../services/storage');
    await deleteConversation(convo.name);

    const { getConversations } = await import('../services/storage');
    this.savedConvos = await getConversations();
  }

  async handleDictate(event: any) {
    const text = event.detail.messageData.join(" ");

    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.value = text;

    await this.send();

    const dictate: any = this.shadowRoot?.querySelector('app-dictate');
    dictate.dictate();
  }

  handleContinuiousDictate(event: any) {
    console.log('event', event.detail.messageData)

    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.value = event.detail.messageData;
  }

  async handleSearch(event: any) {
    console.log(event.target.value);

    const searchTerm = event.target.value;

    const convos = await getConversations();

    if (searchTerm && searchTerm.length > 0) {

      if (convos && convos.length > 0) {
        convos.forEach((convo) => {
          if (convo.name.includes(searchTerm)) {
            this.savedConvos = [convo, ...convos];
          }
        })
      }
    }
    else {
      this.savedConvos = convos;
    }
  }

  openWebResults() {
    const drawer: any = this.shadowRoot?.querySelector('.web-results');
    drawer.show();
  }

  render() {
    return html`
      <!-- <app-header></app-header> -->

      <right-click>
        <fluent-menu>
          <fluent-menu-item @click="${() => this.newConvo()}">
            <sl-icon slot="prefix" src="/assets/send-outline.svg"></sl-icon>
            New Conversation
          </fluent-menu-item>
          <fluent-menu-item @click="${() => this.addImageToConvo()}">
            <sl-icon slot="prefix" src="/assets/image-outline.svg"></sl-icon>
            Add Image
          </fluent-menu-item>
        </fluent-menu>
      </right-click>

      ${this.convoName ? html`
      <sl-drawer class="web-results" placement="start" has-header label="Results from the Web">
        <web-search .searchTerm="${this.convoName}"></web-search>
      </sl-drawer>` : null}

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

       <fluent-search slot="footer" @change="${this.handleSearch}"></fluent-search>
       <fluent-button slot="footer" id="new-convo" size="small" appearance="accent" @click="${() => this.newConvo()}">New Chat</fluent-button>
      </sl-drawer>

      <main>

      <div id="saved">
        <fluent-search @change="${this.handleSearch}"></fluent-search>

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
          <div id="no-messages" class="main-content">
            <img src="/assets/icons/maskable_icon_x512.png" alt="chat" />
            <p>Hello! How may I help you today?</p>

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
          <div id="inner-extra-actions">
          ${this.modelShipper === "openai" ? html`<fluent-button @click="${() => this.addImageToConvo()}" size="small">
            <img src="/assets/image-outline.svg" alt="image icon">
          </fluent-button>` : null}

          <app-dictate @got-text=${this.handleDictate}></app-dictate>

          ${this.convoName ? html`<fluent-button @click="${() => this.openWebResults()}" size="small">Web Results</fluent-button>` : null
      }
        </div>

          <fluent-button appearance="accent" @click="${() => this.openMobileDrawer()}" size="large" circle id="mobile-menu">
            <img src="assets/menu-outline.svg" alt="menu" />
          </fluent-button>
        </div>
        <div id="input-inner">
          ${this.currentPhoto ? html`<img src="${this.currentPhoto}" alt="photo" width="40" height="40" />` : html``}

          <fluent-text-area placeholder="Enter your message"></fluent-text-area>

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
