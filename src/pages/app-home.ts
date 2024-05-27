import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';

import { fluentButton, fluentTextArea, fluentOption, fluentListbox, fluentCard, fluentSearch, fluentMenu, fluentMenuItem, fluentTooltip, provideFluentDesignSystem, baseLayerLuminance } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton(), fluentTextArea(), fluentOption(), fluentListbox(), fluentCard(), fluentSearch(), fluentMenu(), fluentMenuItem(), fluentTooltip());

console.log('baseLayerLuminance', baseLayerLuminance);

import { styles } from '../styles/shared-styles';

import "../components/app-dictate";
import "../components/right-click";
import "../components/web-search";
import "../components/message-skeleton";
import "../components/screen-sharing";
import { marked } from 'marked';

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
  @state() sayIT: boolean = false;
  @state() sharingScreen: boolean = false;

  @state() weatherString: string | undefined;
  @state() forecastString: string | undefined;

  captureStream: any;
  modelShipper: string = "";
  @state() authToken: string | null = null;

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
      css`
        fluent-button, fluent-text-area, fluent-listbox, fluent-card, fluent-tooltip, fluent-search {
          --accent-fill-rest: #8769dc;
          --accent-stroke-control-rest: #8769dc;
          --accent-fill-active: #8769dc;
          --accent-stroke-control-active: #8769dc;
          --accent-fill-hover: #8769dc;
          --accent-stroke-control-hover: #8769dc;
        }

        #now fluent-card {
          padding-left: 16px;
          padding-right: 16px;
        }

        sl-dropdown sl-menu {
          color: white;
          border-radius: 8px;
        }

        fluent-tooltip {
          --neutral-layer-card-container: #8769dc;
          --fill-color: var(--theme-color);
          color: white;
          border: none;
          display: block;

          animation: quickup 0.3s ease;
        }

        fluent-tooltip span {
          color: white;
        }

        sl-dialog::part(footer) {
          gap: 6px;
          display: flex;
          justify-content: end;
          align-items: center;
        }

        #do-delete-button::part(control) {
          background: #c33b3b;
        }

        .mobile-saved::part(footer) {
          padding: 12px;
          padding-bottom: 16px;
        }

        sl-drawer::part(panel) {
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        #model-loading {
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          position: fixed;
          top: 10px;
          right: 40vw;
          left: 40vw;
          z-index: 9999999;
          background: #2d2d2d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-left: 10px;
          padding-right: 10px;
          border-radius: 8px;
          font-size: 14px;

          animation: quickDown 0.5s ease;
        }

        sl-drawer::part(body) {
          padding-top: 0;
        }


        fluent-text-field {
          --theme-color: #424242;
          --neutral-fill-input-rest: var(--theme-color);
          --neutral-fill-input-hover: var(--theme-color);
          --neutral-fill-input-active: var(--theme-color);
          --neutral-fill-input-focus: var(--theme-color);
          background: var(--theme-color);
          color: white;
          border: none;

          border-radius: 8px;
      }

      fluent-text-field::part(root) {
          border: none;
          background: initial;
          border-radius: 8px;
      }

      #rename-input {
        width: 100%;
      }


        .mobile-saved {
          --size: 40rem;
        }

        .mobile-saved::part(panel) {
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
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
          color: #888888;
        }

        #suggested {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 420px;
          padding: 0;
          margin: 0;

          animation: quickup 0.3s ease;
        }


        #suggested li {
          animation: quickup 0.3s ease;
        }

        .system ul, .assistant ul {
          padding: 0;
          margin: 0;
          list-style: initial;
        }

        .system p, .assistant p {
          padding: 0;
          margin: 0;
          margin-top: 8px;
        }

        #suggested li {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #ffffff0f;
          font-size: 16px;
          cursor: pointer;

          padding: 16px;
          min-height: 50px;
          max-width: 128px;
        }

        fluent-card {
          animation: quickup 0.3s ease;
          border: none;
          content-visibility: auto;

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
          background: #8769dc42;
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
          -webkit-backdrop-filter: blur(40px);
          font-size: 14px;

          z-index: 9;
          margin: 0;
          border-radius: 0px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          animation: quickDown 0.3s ease;
        }

        @keyframes quickDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
          margin-right: 3px;
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
          font-size: 16px;
        }

        .content-bar img {
          border-radius: 8px;
          width: 210px;
          margin: 10px;
          cursor: pointer;
          box-shadow: 0px 2px 20px #0000004a;
        }


        main {
          display: grid;
          grid-template-columns: 18vw 82vw;
        }

        #saved {
          /* color: white; */
          --theme-color: rgba(255, 255, 255, 0.06);

          background-color: var(--theme-color);
          /* border-color: #2d2d2d1a; */
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          padding: 8px;
          animation: slideStart 0.3s ease;
          contain: strict;

          margin-left: 8px;
          margin-bottom: 7px;
          border-radius: 8px;
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

          contain: strict;

          height: -webkit-fill-available;
        }

        #convo-list code {
          display: block;
          padding: 8px;
          background: #202020;
          border-radius: 8px;
          margin: 10px;
          overflow-x: auto;
        }

        #convo-list code::-webkit-scrollbar {
          display: none;
        }

        #mainBlock > div {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
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
          height: 16px;
        }

        fluent-text-area {
          border-radius: 8px;

          --theme-color: #262626;
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
          align-self: end;
          margin-bottom: 1px;
        }

        li {
          padding: 8px;
          border-radius: 6px;
        }

        li.user {
          align-self: flex-end;
          background: #8769dc;
          margin-left: 10vw;

          animation: quickup 0.3s ease;
        }

        li.user sl-button {
          border-color: white;
        }

        li.system, li.assistant {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.06);
          margin-right: 10vw;

          animation: quickup 0.3s ease;
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
          max-height: 83vh;
          overflow: hidden auto;
          position: sticky;
          top: 38px;
        }

        #input-block {
          padding: 8px;
          background: #ffffff0f;
          display: flex;
          justify-content: space-between;

          position: unset;
          margin-left: 10px;
          margin-right: 10px;
          margin-bottom: 8px;

          gap: 8px;

          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
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

        #dont-speak {
          background: #8769dc;
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
          margin-top: 5vh;
          max-height: 70vh;

          animation: fadein 0.5s ease;
        }

        #no-messages img {
          width: 220px;
          height: 220px;
          border-radius: 50%;

          animation: fadein 0.8s ease;

          display: none;
        }

        #no-messages.main-content #greeting-text {
          font-weight: bold;
          font-size: 38px;
          width: 420px;

          color: #8769dc;
          font-size: 54px;
          margin-top: 0;
          text-wrap: pretty;

          text-shadow: #8769dc82 2px 2px;

          view-transition-name: greeting-caption;
        }

        @media(prefers-color-scheme: dark) {
          fluent-text-area::part(root) {
            background: var(--theme-color);
            color: white;
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
          }

          fluent-button img, sl-button img, sl-menu-item img {
            filter: invert(1);
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
          li.system, li.assistant {
            --theme-color: white;
            background: var(--theme-color);
          }

          #big-time-button img {

              filter: invert(1);

          }

          sl-dropdown sl-menu {
            background: #cabcf0;
            color: white;
            border-radius: 8px;
          }

          #convo-name .action-bar {
            border-radius: 22px;
            padding-left: 8px;
            padding-right: 8px;
            background: transparent;
          }

          .copy-button::part(label) {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          sl-dialog::part(panel) {
            background: white;
          }

          sl-drawer::part(panel) {
            background: #f1f1f1;

          }

          #convo-list code {
            background: white;
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
            background: transparent;
          }

          li.user {
            color: white;
          }

          #saved {
            --theme-color: #1e1e1e0f;
            background: var(--theme-color);
          }

          #mobile-menu::part(base) {
            background: rgba(0, 0, 0, 0.17);
          }

          #input-block {
            background: var(--theme-color);
          }

          #saved li {
            background: var(--theme-color);
          }

          li.user sl-button img {

              filter: invert(1);

          }

          fluent-tooltip {
            background: white;
            --fill-color: white;
        }

        fluent-tooltip span {
            color: black;
        }
        }

        #mobile-menu {
          display: none;
        }

        #suggested::webkit-scrollbar {
          display: none;
        }

        @media(min-width: 860px) {
          #convo-name {
            left: 20vw;
            right: 0px;
            margin-top: 0;
          }

          #suggested {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            max-height: 38vh;

            display: flex;
            flex-direction: row;
            width: 68vw;
          }

          #suggested li {
            animation: quickup 0.3s ease;
            min-width: 127px;
          }

          #now {
            width: 59vw;
          }

          #no-messages.main-content #greeting-text {
            width: 480px;
          }

          #no-messages {
            margin-top: 10vh;
          }

          li.user, li.system, li.assistant {
            min-width: 30vw;
            max-width: 45vw;
            box-shadow: var(--elevation-shadow-card-rest);
          }

          #saved ul {
            max-height: 84vh;
          }

          #open-camera-button {
            display: none;
          }

          #add-image-to-convo {
            display: initial;
          }
        }

        @media(min-width: 1200px) {
          #saved ul {
            max-height: 85vh;
          }
        }

        @media(max-width: 860px) {
          #saved {
            display: none;
          }

          #suggested li {
            min-height: 46px;
            max-width: initial;
          }

          #convo-name h2 {
            max-width: 60vw;
          }

          #new-convo::part(control) {
            height: 3em;
          }

          #model-loading {
            left: 10vw;
            right: 10vw;
            top: 40px;
          }

          .new-window-button {
            display: none;
          }

          #no-messages.main-content #greeting-text {
            width: 82%;
          }

          main {
            display: flex;
          }

          #convo-list {
            width: unset;

          }

          #mobile-menu {
            display: block;
          }

          #mainBlock {
            width: 100%;
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

          #suggested, #now {
            width: 82%;
          }

          #open-camera-button {
            display: initial;
          }

          #add-image-to-convo {
            display: none;
          }
        }

        .mobile-saved #no-messages img {
          display: initial;
        }

        @media(max-width: 860px) and (min-height: 910px) {
          #convo-list {

          }
        }

        @media(min-height: 1000px) {
          #convo-list {

          }
        }

        @media (max-height: 420px) and (orientation: landscape){
          #convo-list {

          }

          #saved ul {
            max-height: 79vh;
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

        @media(max-height: 655px) {
          #convo-list {

          }
        }

        @media(max-height: 620px) {
          #convo-list {

          }
        }

        @media(max-height: 520px) {
          #convo-list {

          }
        }

        @media(max-width: 300px) {
          #no-messages.main-content #greeting-text {
            font-size: 38px;
          }
        }

        @media(min-width: 700px) and (max-width: 730px) {
          main {
            display: grid;
            grid-template-columns: 24vw 76vw;
          }

          #saved {
            display: initial;
          }

          #input-block {
            left: 31vw;
          }

          #new-convo::part(control) {
            height: initial;
          }

          #no-messages {
            margin-top: 6vh;
          }

          #no-messages.main-content #greeting-text {
            margin-bottom: 8px;
          }

          #convo-name {
            margin-top: 0;
            left: 24vw;
          }

          #convo-list {

          }
        }

        @media (horizontal-viewport-segments: 2) {
          main {
            grid-template-columns: 49vw 49vw;
            gap: 23px;
          }

          #saved {
            padding-right: 12px;
            background: transparent;
          }

          #saved ul {
            display: grid;
            grid-template-columns: 49% 49%;
          }


            sl-drawer::part(panel) {
              width: 49vw;
            }

          #suggested {
            display: grid;
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

      this.authToken = localStorage.getItem("accessToken");
    }, 2000);

    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    const { getConversations } = await import('../services/storage');

    this.savedConvos = await getConversations();

    const { chosenModelShipper } = await import('../services/ai');

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

    // load and set up correct model
    if (chosenModelShipper === "redpajama") {
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("redpajama");
      this.modelLoading = false;
    }
    else if (chosenModelShipper === "llama") {
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("llama");
      this.modelLoading = false;
    }
    else if (chosenModelShipper === "gemma") {
      console.log("loading gemma")
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("gemma");
      this.modelLoading = false;
    }

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

  public async handleModelChange(model: string) {
    this.modelShipper = model;

    const { chosenModelShipper } = await import('../services/ai');

    if (chosenModelShipper === "redpajama") {
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("redpajama");
      this.modelLoading = false;
    }
    else if (chosenModelShipper === "llama") {
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("llama");
      this.modelLoading = false;
    }
    else if (chosenModelShipper === "gemma") {
      console.log("loading gemma")
      const { loadChatModule } = await import('../services/local-ai');

      this.modelLoading = true;
      await loadChatModule("gemma");
      this.modelLoading = false;
    }
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

      dropElement?.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropElement.classList.remove("drag-over");

        const dt = event.dataTransfer;
        const files = dt!.files;

        if (files.length > 0 && files[0].type.includes("image")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64data = e.target?.result;
            this.addImageToConvo(base64data as string);
          }

          reader.readAsDataURL(files[0]);
        }
        else if ((files.length > 0 && files[0].type.includes("audio"))) {
          const { doSpeechToText } = await import("../services/ai");
          const text = await doSpeechToText(files[0]);
          const input: any = this.shadowRoot?.querySelector('fluent-text-area');
          input.value = text;
        }
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
    const shareUrl = `${location.href}?title=${this.convoName}&convo=${encodeURIComponent(JSON.stringify(convo))}`
    await navigator.share({
      title: name,
      text: name,
      url: shareUrl
    });
  }

  openInNewWindow() {
    // const windowURL = `${location.href}?title=${this.convoName}&convo=${JSON.stringify(this.previousMessages)}`;
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

  openCamera() {
    const input = document.createElement('input');
    input.type = "file";
    input.name = "image";
    input.accept = "image/*";
    input.capture = "environment";

    input.click();

    // add iamge from input
    input.addEventListener("change", async (event: any) => {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        this.addImageToConvo(base64data as string);
      }

      reader.readAsDataURL(file);
    });
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
    const { renameConvo } = await import("../services/storage");

    const renameInput = this.shadowRoot!.querySelector("#rename-input") as HTMLInputElement;

    console.log("renameInput", renameInput.value, this.convoName)

    await renameConvo(this.convoName as string, renameInput.value);

    const dialog = this.shadowRoot!.querySelector(".rename-dialog") as any;
    await dialog.hide();

    this.convoName = renameInput.value;

    const { getConversations } = await import('../services/storage');

    this.savedConvos = await getConversations();
  }

  async send(): Promise<void> {
    return new Promise(async (resolve): Promise<void> => {
      const input: any = this.shadowRoot?.querySelector('fluent-text-area');
      const inputValue = input?.value;
      const list: any = this.shadowRoot?.querySelector('#convo-list');

      const { chosenModelShipper } = await import('../services/ai');

      const modelShipper = chosenModelShipper;

      if (this.previousMessages.length === 0) {
        // first coupe of words of inputValue
        const convoName = inputValue?.split(" ").slice(0, 8).join(" ");
        this.convoName = convoName;
      }

      // remove newline character from inputValue
      const prompt = inputValue?.replace(/\n/g, " ");

      if (input && inputValue && prompt) {
        let streamedContent = "";

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

        if (modelShipper === "google") {
          const { makeAIRequestWithGemini } = await import('../services/ai');
          const data = await makeAIRequestWithGemini(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "system",
              content: "",
              // content: data
            }
          ];

          this.handleScroll(list);

          let text = '';
          for await (const chunk of data) {
            const chunkText = chunk.text();
            console.log(chunkText);
            text += chunkText;

            if (text && text.length > 0) {

              this.previousMessages[this.previousMessages.length - 1].content = marked.parse(text);

              this.previousMessages = this.previousMessages;

              this.requestUpdate();
            }
          }

          await this.doSayIt(text);

          if (this.previousMessages.length > 1) {
            const { marked } = await import('marked');
            this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(this.previousMessages[this.previousMessages.length - 1].content);

            const goodMessages = this.previousMessages;

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos);

            this.loading = false;

            this.handleScroll(list);

            resolve();
          }

          this.loading = false;

          this.handleScroll(list);

          resolve();
        }
        else if (this.inPhotoConvo === true || (this.currentPhoto && this.currentPhoto !== "")) {

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              content: "<message-skeleton></message-skeleton>",
              // content: data
            }
          ];

          const { makeAIRequestWithImage } = await import('../services/ai');
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

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
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
        else if (modelShipper === "redpajama" || modelShipper === "llama" || modelShipper === "gemma") {
          const { loadChatModule } = await import('../services/local-ai');

          this.modelLoading = true;
          await loadChatModule(modelShipper);
          this.modelLoading = false;

          const { requestLocalAI } = await import('../services/local-ai');

          console.log("prev messages 1", this.previousMessages);

          // this.previousMessages = [
          //   ...this.previousMessages,
          //   {
          //     role: "assistant",
          //     // content: data.choices[0].message.content,
          //     content: ""
          //   }
          // ];
          console.log("prev messages 2", this.previousMessages);

          this.handleScroll(list);

          const asyncGen = await requestLocalAI(this.previousMessages);

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              // content: data.choices[0].message.content,
              content: ""
            }
          ];

          let message = "";
          for await (const chunk of asyncGen) {
            console.log(chunk);
            if (chunk.choices[0].delta.content) {
              // Last chunk has undefined content
              message += chunk.choices[0].delta.content;
              streamedContent += message;

              if (streamedContent && streamedContent.length > 0) {

                this.previousMessages[this.previousMessages.length - 1].content = marked.parse(message);

                this.previousMessages = this.previousMessages;
                console.log("prev messages 3", this.previousMessages);

                this.requestUpdate();
              }
            }
            // engine.interruptGenerate();  // works with interrupt as well
          }

          await this.doSayIt(streamedContent);

          if (this.previousMessages.length > 1) {
            const { marked } = await import('marked');
            this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(this.previousMessages[this.previousMessages.length - 1].content);

            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)
            console.log("prev messages 4", goodMessages);

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
            this.savedConvos = await getConversations();

            console.log("this.savedConvos", this.savedConvos);

            this.loading = false;

            this.handleScroll(list);

            resolve();
          }

          resolve();
        }
        else {
          // const { makeAIRequestStreaming } = await import('../services/ai');
          // const evtSource = await makeAIRequestStreaming(this.currentPhoto ? this.currentPhoto : "", prompt as string, this.previousMessages);

          // this.previousMessages = [
          //   ...this.previousMessages,
          //   {
          //     role: "system",
          //     // content: data.choices[0].message.content,
          //     content: ""
          //   }
          // ]

          // evtSource.onmessage = async (event) => {
          //   console.log('event', event);
          //   this.handleScroll(list);

          //   const data = JSON.parse(event.data);
          //   console.log('data', data);

          //   // close evtSource if the response is complete
          //   if (data.choices[0].finish_reason !== null) {
          //     console.log("data stream closed");

          //     evtSource.close();

          //     await this.doSayIt(streamedContent);

          //     streamedContent = "";

          //     const markedContent = await marked.parse(this.previousMessages[this.previousMessages.length - 1].content);
          //     this.previousMessages[this.previousMessages.length - 1].content = markedContent;

          //     window.requestIdleCallback(async () => {
          //       if (this.previousMessages.length > 1) {
          //         const goodMessages = this.previousMessages;

          //         const { saveConversation } = await import('../services/storage');
          //         await saveConversation(this.convoName as string, goodMessages);

          //         const { getConversations } = await import('../services/storage');
          //         this.savedConvos = await getConversations();

          //         console.log("this.savedConvos", this.savedConvos)
          //       }


          //     }, { timeout: 1000 });

          //     this.loading = false;

          //     this.handleScroll(list);

          //     resolve();
          //   }

          //   // continuously add to the last message in this.previousMessages
          //   // this.previousMessages[this.previousMessages.length - 1].content += data.choices[0].delta.content;

          //   if (data.choices[0].delta.content && data.choices[0].delta.content.length > 0) {
          //     streamedContent += data.choices[0].delta.content;

          //     if (streamedContent && streamedContent.length > 0) {

          //       // turn "" into '' so that marked can parse it
          //       streamedContent = streamedContent.replace(/"/g, "'");

          //       const markdown = await marked.parse(streamedContent);
          //       console.log("markdown", markdown)

          //       this.previousMessages[this.previousMessages.length - 1].content = markdown;

          //       this.previousMessages = this.previousMessages;

          //       this.requestUpdate();
          //     }
          //   }
          // }

          this.previousMessages = [
            ...this.previousMessages,
            {
              role: "assistant",
              // content: data.choices[0].message.content,
              content: "<message-skeleton></message-skeleton>"
              // content: data
            }
          ];

          const { makeAIRequest } = await import('../services/ai');
          const data = await makeAIRequest(this.currentPhoto ? this.currentPhoto : "", inputValue as string, this.previousMessages);

          const { marked } = await import('marked');
          this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(data.choices[0].message.content);

          this.doSayIt(data.choices[0].message.content);

          this.handleScroll(list);

          if (this.previousMessages.length > 1) {
            console.log("look here", this.convoName, this.previousMessages);

            const goodMessages = this.previousMessages;

            console.log("goodMessages", goodMessages)

            const { saveConversation } = await import('../services/storage');
            await saveConversation(this.convoName as string, goodMessages);

            const { getConversations } = await import('../services/storage');
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
        // const regex = /(<([^>]+)>)/ig;
        // const result = text.replace(regex, "");

        const { doTextToSpeech } = await import("../services/ai");
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

    console.log("convoContent", convo.content)

    if (convo.content[0].image && convo.content[0].image.length > 0) {
      this.currentPhoto = convo.content[0].image;
    }
    else {
      this.currentPhoto = "";
      this.inPhotoConvo = false;
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

  async openVoiceMode() {
    const { router } = await import("../router");
    router.navigate("/voice");
  }

  async newConvo() {
    this.previousMessages = [];
    this.convoName = undefined;
    this.currentPhoto = undefined;
    this.inPhotoConvo = false;

    if (this.modelShipper === "redpajama") {
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
    const { deleteConversation } = await import('../services/storage');
    await deleteConversation(this.convoName as string);

    const { getConversations } = await import('../services/storage');
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
      const { doSearch } = await import("../services/local-search");
      const results = await doSearch(searchTerm);

      console.log("results", results);

      this.savedConvos = [...results];
    }
    else {
      const { getConversations } = await import('../services/storage');
      const convos = await getConversations();
      this.savedConvos = convos;
    }

    // const convos = await getConversations();

    // if (searchTerm && searchTerm.length > 0) {

    //   if (convos && convos.length > 0) {
    //     convos.forEach((convo: any) => {
    //       if (convo.name.includes(searchTerm)) {
    //         this.savedConvos = [convo, ...convos];
    //       }
    //     })
    //   }
    // }
    // else {
    //   this.savedConvos = convos;
    // }
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

    const { doTextToSpeech } = await import("../services/ai");
    await doTextToSpeech(result);
  }

  async openInViewer(content: string) {
    console.log("content", content)
    // content is a string of html, find the image element inside this html
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const image = doc.querySelector('img');

    const imageSrc = image?.getAttribute('src');

    console.log("imageSrc", imageSrc)

    // open in new tab
    window.open(imageSrc as string, "_blank");
  }

  render() {
    return html`
      <!-- <app-header></app-header> -->

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
      </right-click>

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

              <div class="action-bar">
                <sl-button circle size="small" @click="${() => this.deleteConvo()}" class="delete-button">
                  <img src="/assets/trash-outline.svg" alt="delete" />
                </sl-button>
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
            <sl-button circle size="small" @click="${() => this.deleteConvo()}" class="delete-button">
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

            <div class="content-bar" @click="${() => this.openInViewer(message.content)}">
              ${message.image ? html`<img src="${message.image}" alt="photo" />` : html``}
              <div .innerHTML="${message.content}"></div>
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
              <!-- ${this.quickActions.map((action: any) => {
          return html`<li @click="${() => this.preDefinedChat(action)}">${action}</li>`
        })
        } -->
              <!-- <li @click="${() => this.preDefinedChat("Write some JavaScript code to make a request to an api")}">Write some JavaScript code to make a request to an api</li>
              <li @click="${() => this.preDefinedChat("Give me a recipe for a chocolate cake")}">Give me a recipe for a chocolate cake</li> -->
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


          <app-dictate @got-text=${this.handleDictate}></app-dictate>

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
