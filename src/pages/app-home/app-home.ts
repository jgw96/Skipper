import { LitElement, html, unsafeCSS } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';

import { fluentButton, fluentTextArea, fluentOption, fluentListbox, fluentCard, fluentSearch, fluentMenu, fluentMenuItem, fluentTooltip, provideFluentDesignSystem, baseLayerLuminance } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton(), fluentTextArea(), fluentOption(), fluentListbox(), fluentCard(), fluentSearch(), fluentMenu(), fluentMenuItem(), fluentTooltip());

import { styles } from '../../styles/shared-styles';
import cssModule from './app-home.css?inline';

import "../../components/app-dictate";
import "../../components/local-dictate";
import "../../components/right-click";
import "../../components/web-search";
import "../../components/message-skeleton";
import "../../components/screen-sharing";
import "../../components/app-search";

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
  @state() inPhotoConvo: boolean = false;

  @state() modelLoading = false;
  @state() localModelLoaded = false;
  @state() sayIT: boolean = false;
  @state() sharingScreen: boolean = false;

  @state() weatherString: string | undefined;
  @state() forecastString: string | undefined;

  @state() currentImageSrc: string | undefined;

  captureStream: any;
  modelShipper: string = "";
  @state() authToken: string | null = null;

  phiWorker: Worker | undefined;

  quickActions = [
    "Generate a blog post",
    "Explain a topic",
    "Translate text to Spanish",
    "Summarize a legal document",
    "Summarize a research paper",
    "Help brainstorm a story",
  ];


  static get styles() {
    return [
      styles,
      unsafeCSS(cssModule)
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    setTimeout(async () => {
      // hacky to put this in a setTimeout, but alas
      const { handleShareTargetFile } = await import("../../services/utils");
      const base64data = await handleShareTargetFile();
      this.addImageToConvo(base64data as string);

      this.authToken = localStorage.getItem("accessToken");
    }, 2000);

    const { getConversations } = await import('../../services/storage');

    this.savedConvos = await getConversations();

    const { chosenModelShipper } = await import('../../services/ai');

    this.modelShipper = chosenModelShipper;
    this.requestUpdate();

    // set up enter key to send message
    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.addEventListener("keyup", (event: any) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.send();
      }
    });

    // handle drag and drop
    this.addImageWithDragDrop();

    // check if we are deeplinked into a convo
    const queryParams = new URLSearchParams(window.location.search);
    const title = queryParams.get('title');
    const convo = JSON.parse(queryParams.get('convo')!);

    if (title && convo) {
      this.convoName = title;
      this.previousMessages = convo;
    }

    // get position for actions
    window.requestIdleCallback(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        localStorage.setItem("lat", position.coords.latitude.toString());
        localStorage.setItem("long", position.coords.longitude.toString());
      });
    }, {
      timeout: 1000
    });

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
      const fluentMenu: any = this.shadowRoot?.querySelectorAll("right-click fluent-menu-item");
      for (let i = 0; i < fluentMenu.length; i++) {
        baseLayerLuminance.setValueFor(fluentMenu[i], 0.1)
      }
    }
  }

  public async handleModelChange(model: string): Promise<void> {
    return new Promise(async (resolve) => {
      this.modelShipper = model;

      const { chosenModelShipper } = await import('../../services/ai');

      if (chosenModelShipper === "phi3") {
        this.modelLoading = true;

        this.phiWorker = new Worker(
          new URL('../../services/phi.ts', import.meta.url),
          { type: 'module' }
        );

        this.phiWorker.onmessage = (event: any) => {
          console.log("Message received from worker: ", event.data);
          if (event.data.type === "loaded") {
            this.modelLoading = false;

            this.localModelLoaded = true;
            resolve();
          }
        }

        this.phiWorker.postMessage({ type: "Init" });
      }
    });
  }

  async addImageWithDragDrop() {
    window.addEventListener('image-dropped', async (event: any) => {
      const base64data = event.detail.data;
      this.addImageToConvo(base64data);
    });

    window.addEventListener('audio-dropped', async (event: any) => {
      const text = event.detail.data;
      const input: any = this.shadowRoot?.querySelector('fluent-text-area');
      input.value = text;
    });

    const { setUpDragDrop } = await import('../../services/drag-drop');
    setUpDragDrop(this.shadowRoot!.querySelector('#input-block')!);
  }

  async shareConvo(name: string, convo: Array<any>) {
    const shareUrl = `${location.href}?title=${this.convoName}&convo=${encodeURIComponent(JSON.stringify(convo))}`
    await navigator.share({
      title: name,
      text: name,
      url: shareUrl
    });
  }

  openInNewWindow() {
    const windowURL = `${location.href}?title=${this.convoName}&convo=${encodeURIComponent(JSON.stringify(this.previousMessages))}`
    window.open(windowURL, "new-window", "width=600,height=600");
  }

  preDefinedChat(chat: string) {
    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.value = chat;

    this.send();
  }

  async addImageToConvo(base64data?: string | undefined) {
    if (base64data) {
      this.currentPhoto = base64data;
      this.inPhotoConvo = true;
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
      this.inPhotoConvo = true;
    }

    reader.readAsDataURL(blobFromFile);
  }

  async openCamera() {
    await import("../../components/app-camera")
    const appCamera = this.shadowRoot?.querySelector('app-camera');
    (appCamera as any)!.startCamera();

    const drawer: any = this.shadowRoot?.querySelector('#app-camera');

    drawer.addEventListener("sl-hide", async () => {
      (appCamera as any)!.stopCameraAndCleanup();
    })

    appCamera?.addEventListener("photo-taken", async (event: any) => {
      await drawer.hide();

      const base64data = event.detail.photo;
      this.addImageToConvo(base64data);
    });

    drawer.show();
  }

  async copyConvoToClipboard() {
    let convo = "";
    this.previousMessages.forEach((message: any) => {
      if (message.role === "user") {
        convo += `You: ${message.content}\n`;
      }
      else {
        convo += `Bot: ${message.content}\n`;
      }
    });

    await navigator.clipboard.writeText(convo);
  }

  async renameConversation() {
    const { renameConvo } = await import("../../services/storage");

    const renameInput = this.shadowRoot!.querySelector("#rename-input") as HTMLInputElement;

    console.log("renameInput", renameInput.value, this.convoName)

    await renameConvo(this.convoName as string, renameInput.value);

    const dialog = this.shadowRoot!.querySelector(".rename-dialog") as any;
    await dialog.hide();

    this.convoName = renameInput.value;

    const { getConversations } = await import('../../services/storage');

    this.savedConvos = await getConversations();
  }

  async send(): Promise<void> {
    return new Promise(async (resolve): Promise<void> => {
      const input: any = this.shadowRoot?.querySelector('fluent-text-area');
      const inputValue = input?.value;
      const list: any = this.shadowRoot?.querySelector('#convo-list');

      const { chosenModelShipper } = await import('../../services/ai');

      const modelShipper = chosenModelShipper;

      if (this.previousMessages.length === 0) {
        // first coupe of words of inputValue
        const convoName = inputValue?.split(" ").slice(0, 8).join(" ");
        this.convoName = convoName;
      }

      // remove newline character from inputValue
      const prompt = inputValue?.replace(/\n/g, " ");

      if (input && inputValue && prompt) {
        // let streamedContent = "";

        this.loading = true;

        input.value = "";

        if (this.sharingScreen === true) {
          const screen: any = this.shadowRoot?.querySelector('screen-sharing');
          if (screen) {
            screen.takeScreenshotFromStreamCont();
          }

          this.sharingScreen = false;
        }

        this.previousMessages = [
          ...this.previousMessages,
          {
            role: "user",
            content: prompt,
            image: this.currentPhoto
          }
        ];

        this.handleScroll(list);

        console.log("this.currentPhoto", this.currentPhoto);
        console.log("this.inPhotoConvo", this.inPhotoConvo);


        if (this.inPhotoConvo === true || (this.currentPhoto && this.currentPhoto !== "")) {

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              content: "<message-skeleton></message-skeleton>",
              // content: data
            }
          ];

          const { makeAIRequestWithImage } = await import('../../services/ai');
          const data = await makeAIRequestWithImage(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          if (this.currentPhoto) {
            this.currentPhoto = undefined;
            this.inPhotoConvo = true;
          }

          await this.doSayIt(data.choices[0].message.content);

          // this.previousMessages = [
          //   ...this.previousMessages,
          //   {
          //     role: "assistant",
          //     content: data.choices[0].message.content,
          //     // content: data
          //   }
          // ];

          // replace content of last message with the actual content
          this.previousMessages[this.previousMessages.length - 1].content = data.choices[0].message.content;

          this.handleScroll(list);

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const { marked } = await import('marked');

            this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(this.previousMessages[this.previousMessages.length - 1].content);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos)

            this.loading = false;

            this.handleScroll(list);

            resolve();
          }

          this.loading = false;

          this.handleScroll(list);

          resolve();
        }
        else if (modelShipper === "phi3") {
          console.log("phi3 model", this.localModelLoaded);
          if (this.localModelLoaded === false) {
            await this.handleModelChange("phi3");
          }

          this.handleScroll(list);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              content: ""
            }
          ];

          let completeMessage = "";

          this.phiWorker!.onmessage = async (event: any) => {
            if (event.data.type === "done") {
              this.modelLoading = false;
            }
            else if (event.data.type === "response") {
              console.log(event.data.response);
              const message = event.data.response;

              console.log("Message received: ", message);
              completeMessage = message;

              const { marked } = await import('marked');
              this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(completeMessage);

              this.previousMessages = this.previousMessages;
              console.log("prev messages 3", this.previousMessages);

              this.requestUpdate();
            }
          }

          this.phiWorker!.postMessage({
            type: "Query",
            continuation: false,
            prompt: prompt
          });

          if (this.previousMessages.length > 1) {
            const { marked } = await import('marked');
            this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(this.previousMessages[this.previousMessages.length - 1].content);

            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)
            console.log("prev messages 4", goodMessages);

            const { saveConversation } = await import('../../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos);

            this.loading = false;

            this.handleScroll(list);

            resolve();
          }

          resolve();
        }
        else {
          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              content: "<message-skeleton></message-skeleton>"
            }
          ];

          const { makeAIRequest } = await import('../../services/ai');
          const data = await makeAIRequest(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          const { marked } = await import('marked');
          this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(data.choices[0].message.content);

          this.doSayIt(data.choices[0].message.content);

          this.handleScroll(list);

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos)

            this.loading = false;

            this.handleScroll(list);

            resolve();
          }

          this.loading = false;

          this.handleScroll(list);

          resolve();

        }

      }
    });
  }

  async doSayIt(text: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.sayIT) {
        const { doTextToSpeech } = await import("../../services/ai");
        await doTextToSpeech(text);

        resolve();
      }
      else {
        resolve()
      }
    })
  }

  private handleScroll(list: HTMLUListElement | null | undefined) {
    const lastElement = list?.lastElementChild;
    // scroll to the bottom of the last element
    lastElement?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  async startConvo(convo: any) {
    this.previousMessages = [];

    if (typeof convo.convo === "string") {
      convo.convo = JSON.parse(convo.convo);
    }

    if (convo.convo[0].image && convo.convo[0].image.length > 0) {
      this.currentPhoto = convo.convo[0].image;
    }
    else {
      this.currentPhoto = "";
      this.inPhotoConvo = false;
    }

    this.previousMessages = convo.convo;
    this.convoName = undefined;
    await this.requestUpdate();

    this.convoName = convo.name;
    await this.requestUpdate();

    await this.updated;

    this.handleScroll(this.shadowRoot?.querySelector('#convo-list'))

    const drawer: any = this.shadowRoot?.querySelector('.mobile-saved');
    await drawer?.hide();
  }

  async openVoiceMode() {
    const { router } = await import("../../router");
    router.navigate("/voice");
  }

  async newConvo() {
    this.previousMessages = [];
    this.convoName = undefined;
    this.currentPhoto = undefined;
    this.inPhotoConvo = false;

    // if (this.modelShipper === "redpajama") {
    //   const { resetLocal } = await import('../../services/local-ai');
    //   await resetLocal();
    // }

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
    const regex = /(<([^>]+)>)/ig;
    const result = content.replace(regex, "");

    await navigator.clipboard.writeText(result);
  }

  async shareButton(content: string) {
    await navigator.share({
      title: 'GPT4-chat',
      text: content,
      url: ''
    });
  }

  async deleteConvo() {
    const deleteDialog: any = this.shadowRoot?.querySelector('.delete-dialog');
    deleteDialog?.show();
  }

  async doDelete() {
    const { deleteConversation } = await import('../../services/storage');
    await deleteConversation(this.convoName as string);

    const { getConversations } = await import('../../services/storage');
    this.savedConvos = await getConversations();

    const deleteDialog: any = this.shadowRoot?.querySelector('.delete-dialog');
    await deleteDialog?.hide();

    this.newConvo();
  }

  closeDeleteDialog() {
    const deleteDialog: any = this.shadowRoot?.querySelector('.delete-dialog');
    deleteDialog?.hide();
  }

  closeRenameDialog() {
    const renameDialog: any = this.shadowRoot?.querySelector('.rename-dialog');
    renameDialog?.hide();
  }

  openRenameDialog() {
    const renameDialog: any = this.shadowRoot?.querySelector('.rename-dialog');
    renameDialog?.show();
  }

  async handleDictate(event: any) {
    console.log("handle dictate", event.detail.messageData)
    const text = event.detail.messageData[0];

    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.value = text;

    await this.send();
    console.log("sent");

    if (this.sayIT === false) {
      const dictate: any = this.shadowRoot?.querySelector('app-dictate');
      dictate.dictate();
    }
  }

  handleContinuiousDictate(event: any) {
    console.log('event', event.detail.messageData)

    const input: any = this.shadowRoot?.querySelector('fluent-text-area');
    input.value = event.detail.messageData;
  }

  async handleSearch(event: any) {
    console.log(event.target.value);

    const searchTerm = event.target.value;

    if (searchTerm && searchTerm.length > 0) {
      const { doSearch } = await import("../../services/local-search");
      const results = await doSearch(searchTerm);

      console.log("results", results);

      this.savedConvos = [...results];
    }
    else {
      const { getConversations } = await import('../../services/storage');
      const convos = await getConversations();
      this.savedConvos = convos;
    }
  }

  openWebResults() {
    const drawer: any = this.shadowRoot?.querySelector('.web-results');
    drawer.show();
  }

  doSpeech() {
    this.sayIT = !this.sayIT;
  }

  async speakIt(content: string) {
    const regex = /(<([^>]+)>)/ig;
    const result = content.replace(regex, "");

    const { doTextToSpeech } = await import("../../services/ai");
    await doTextToSpeech(result);
  }

  async openInViewer(content: string) {
    await import("../../components/image-viewer");

    console.log("content", content)
    // content is a string of html, find the image element inside this html
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const image = doc.querySelector('img');

    const imageSrc = image?.getAttribute('src');

    console.log("imageSrc", imageSrc)

    this.currentImageSrc = imageSrc as string;

    const drawer: any = this.shadowRoot?.querySelector('#image-viewer-drawer');
    drawer.show();

    // open in new tab
    // window.open(imageSrc as string, "_blank");
  }

  render() {
    return html`
      ${this.modelLoading ? html`<div id="model-loading">
        <p>Loading local model...</p>
        <sl-spinner></sl-spinner>
      </div>` : null}

      <sl-dialog label="Delete Conversation?" class="delete-dialog">
        Are you sure you would like to delete this conversation?
        <fluent-button @click="${this.closeDeleteDialog}" slot="footer" appearance="accent">Cancel</fluent-button>
        <fluent-button @click="${this.doDelete}" slot="footer" id="do-delete-button" appearance="danger">Delete</fluent-button>
      </sl-dialog>

      <sl-dialog label="Rename Conversation" class="rename-dialog">
        <fluent-text-field id="rename-input"></fluent-text-field>
        <fluent-button @click="${this.closeRenameDialog}" slot="footer" appearance="danger">Cancel</fluent-button>
        <fluent-button @click="${() => this.renameConversation()}" slot="footer" appearance="accent">Confirm</fluent-button>
      </sl-dialog>

      <right-click>
          <fluent-menu-item @click="${() => this.newConvo()}">
            <sl-icon slot="prefix" src="/assets/send-outline.svg"></sl-icon>
            New Conversation
          </fluent-menu-item>
          <fluent-menu-item @click="${() => this.addImageToConvo()}">
          <sl-icon slot="prefix" src="/assets/image-outline.svg"></sl-icon>
            Add Image
          </fluent-menu-item>
          <fluent-menu-item @click="${() => this.openVoiceMode()}">
            <sl-icon slot="prefix" src="/assets/mic-outline.svg"></sl-icon>
            Voice Mode
          </fluent-menu-item>
          <fluent-menu-item @click="${this.openInNewWindow}">
            <sl-icon slot="prefix" src="/assets/open-outline.svg"></sl-icon>
            Open in New Window
          </fluent-menu-item>

      </right-click>

      <sl-drawer id="image-viewer-drawer" placement="end">
        <image-viewer .src="${this.currentImageSrc}" .alt="Image Alt"></image-viewer>
      </sl-drawer>

      <sl-drawer id="app-camera" placement="bottom">
        <app-camera></app-camera>
      </sl-drawer>

      ${this.convoName ? html`
      <sl-drawer class="web-results" placement="end" has-header label="Results from the Web">
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
            </fluent-card>`
    }
    )}
          </ul>
          ` : html`
          <div id="no-messages">
            <img src="/assets/robot-shrugs.webp">
            <p>No saved conversations</p>
          </div>
          `
      }
       </div>

       <!-- <fluent-search slot="footer" @change="${this.handleSearch}"></fluent-search> -->
       ${this.savedConvos && this.savedConvos.length > 0 ? html`<app-search slot="footer" @open-convo="${($event: any) => this.startConvo($event.detail.convo)}" .savedConvos=${this.savedConvos}></app-search>` : null}
       <fluent-button slot="footer" id="new-convo" size="small" appearance="accent" @click="${() => this.newConvo()}">New Chat</fluent-button>
      </sl-drawer>

      <main>

      <div id="saved">
      ${this.savedConvos && this.savedConvos.length > 0 ? html`<app-search @open-convo="${($event: any) => this.startConvo($event.detail.convo)}" .savedConvos=${this.savedConvos}></app-search>` : null}
        ${this.savedConvos.length > 0 ? html`
          <ul>
            ${this.savedConvos.map((convo) => {
        return html`<fluent-card @click="${() => this.startConvo(convo)}">
          <div class="title-bar">
            <span>${convo.name}</span>

            <span class="date-display">${new Date(convo.date).toLocaleDateString()}</span>
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

            <sl-dropdown hoist>
              <fluent-button class="copy-button" slot="trigger" caret>
                <img src="/assets/ellipsis-horizontal-outline.svg" alt="menu" />
              </fluent-button>
              <sl-menu>
                <sl-menu-item class="copy-button new-window-button" @click="${this.openInNewWindow}">
                  <img slot="prefix" src="/assets/open-outline.svg" alt="open" />
                  Open in New Window
                </sl-menu-item>
                <sl-menu-item @click="${() => this.copyConvoToClipboard()}" class="copy-button">
                  <img slot="prefix" src="/assets/copy-outline.svg" alt="share" />
                  Copy to Clipboard
                </sl-menu-item>
                <sl-menu-item class="copy-button" @click="${() => this.openRenameDialog()}">
                <img slot="prefix" src="/assets/settings-outline.svg" alt="share" />
                  Rename Conversation
                </sl-menu-item>
                <sl-menu-item class="copy-button" @click="${() => this.deleteConvo()}">
                  <img slot="prefix" src="/assets/trash-outline.svg" alt="trash" />
                  Delete Conversation
                </sl-menu-item>
              </sl-menu>
            </sl-dropdown>


            <!-- ${this.convoName ? html`<fluent-button @click="${() => this.openWebResults()}" size="small" class="copy-button">
            <img src="/assets/globe-outline.svg" alt="web results icon">
             </fluent-button>` : null
        } -->

              <fluent-button circle @click="${() => this.shareConvo(this.convoName || "", this.previousMessages)}" class="copy-button">
                <img src="/assets/share-social-outline.svg" alt="share" />
              </fluent-button>
            </div>
        </div>
        <ul id="convo-list">
          ${this.previousMessages.map((message) => {
          return html`<li class="${message.role}">
            <div class="item-toolbar">
                ${message.role === "assistant" ? html`<img class="robot-icon" src="/assets/icons/64-icon.png" />` : html`<div></div>`}
                <div>
                <sl-button @click="${() => this.shareButton(message.content)}" circle size="small" class="copy-button">
                  <img src="/assets/share-social-outline.svg" alt="share" />
                </sl-button>

                <sl-button @click="${() => this.copyButton(message.content)}" circle size="small" class="copy-button">
                  <img src="/assets/copy-outline.svg" alt="copy" />
                </sl-button>

                <sl-button @click="${() => this.speakIt(message.content)}" circle size="small" class="copy-button">
                  <img src="/assets/volume-high-outline.svg" alt="copy" />
                </sl-button>
                </div>
            </div>

            <div class="content-bar">
              ${message.image ? html`<div><img src="${message.image}" alt="photo" /></div>` : html``}
              <div .innerHTML="${message.content}"></div>

              ${message.content.includes("<img") ? html`<fluent-button class="open-image-button" @click="${() => this.openInViewer(message.content)}" size="small">Open Image</fluent-button>` : null}
            </div>
          </li>`
        })
        }
        </ul>


       ` : html`
          <div id="no-messages" class="main-content">
            <img src="/assets/icons/maskable_icon_x512.png" alt="chat" />
            <p id="greeting-text">Hello! How may I help you today?</p>

            <ul id="suggested">
              ${this.modelShipper === "openai" ? html`<li @click="${() => this.preDefinedChat("What is the weather like?")}">What is the weather like?</li>` : null}
              ${this.modelShipper === "openai" ? html`<li @click="${() => this.preDefinedChat("Give me the latest news")}">Give me the latest news</li>` : null}
              ${this.modelShipper === "openai" ? html`<li @click="${() => this.preDefinedChat("Write some JavaScript code to make a request to an api")}">Write some JavaScript code to make a request to an api</li>` : null}
              ${this.authToken && this.authToken.length > 0 && this.modelShipper === "openai" ? html`
                  <li @click="${() => this.preDefinedChat("What is my latest email?")}">What is my latest email?</li>
                  <li @click="${() => this.preDefinedChat("Send an email")}">Send an email</li>
                  <li @click="${() => this.preDefinedChat("Search my email")}">Search my email</li>
                  <li @click="${() => this.preDefinedChat("Get my todos")}">Get my todos</li>
                  <li @click="${() => this.preDefinedChat("Set a todo")}">Set a todo</li>
                ` : null
        }
              ${this.modelShipper === "openai" ? html`<li @click="${() => this.preDefinedChat("Generate an image of a Unicorn")}">Generate an image of a Unicorn</li>` : null}
              ${this.quickActions.map((action: any) => {
          return html`<li @click="${() => this.preDefinedChat(action)}">${action}</li>`
        })
        }
              <li @click="${() => this.preDefinedChat("Write some JavaScript code to make a request to an api")}">Write some JavaScript code to make a request to an api</li>
              <li @click="${() => this.preDefinedChat("Give me a recipe for a chocolate cake")}">Give me a recipe for a chocolate cake</li>
            </ul>
          </div>
       `}

       <div id="input-block">

        <div id="extra-actions">
          <div id="inner-extra-actions">
          ${this.modelShipper === "openai" || this.modelShipper === "google" ? html`<fluent-button @click="${() => this.addImageToConvo()}" id="add-image-to-convo" size="small">
          <img src="/assets/image-outline.svg" alt="image icon">
          </fluent-button>
          <fluent-tooltip anchor="add-image-to-convo"><span>Add an image</span></fluent-tooltip>

          <fluent-button id="open-camera-button" @click="${() => this.openCamera()}" apperance="accent" size="small">
            <img src="/assets/camera-outline.svg" alt="camera icon">
          </fluent-button>
          ` : null}

          <screen-sharing @streamStarted="${this.sharingScreen = true}" @screenshotTaken="${($event: any) => this.addImageToConvo($event.detail.src)}"></screen-sharing>


          ${this.modelShipper === "phi3" ? html`<local-dictate></local-dictate>` : html`<app-dictate @got-text=${this.handleDictate}></app-dictate>`}

          ${this.sayIT === false ? html`<fluent-button @click="${this.doSpeech}" id="do-speech" size="small">
            <img src="/assets/volume-high-outline.svg" alt="mic icon">
          </fluent-button>
          <fluent-tooltip anchor="do-speech"><span>Read Aloud</span></fluent-tooltip>
          ` : html`
            <fluent-button id="dont-speak" @click="${this.doSpeech}" appearance="accent" size="small">
              <img src="/assets/volume-mute-outline.svg" alt="mic icon">
            </fluent-button>
          `}

        </div>

        <div id="inner-extra-actions">
          <fluent-button appearance="accent" @click="${() => this.openMobileDrawer()}" size="large" circle id="mobile-menu">
            <img src="assets/menu-outline.svg" alt="menu" />
          </fluent-button>
      </div>
        </div>
        <div id="input-inner">
          ${this.currentPhoto ? html`<img src="${this.currentPhoto}" alt="photo" width="40" height="40" />` : html``}

          <fluent-text-area ?disabled="${this.modelLoading}" placeholder="Enter your message"></fluent-text-area>

          <fluent-button id="big-time-button" ?loading="${this.loading}" ?disabled="${this.loading}" appearance="accent" type="primary" @click=${this.send}>
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
