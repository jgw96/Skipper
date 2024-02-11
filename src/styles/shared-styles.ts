import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }

  main {
    margin-top: 30px;
    height: calc(100vh - 30px);
  }

  fluent-card{
    --neutral-foreground-rest: white;
  }

  fluent-text-area, fluent-text-area::part(control), fluent-select::part(control), fluent-select::part(listbox) {
    --neutral-fill-input-rest: var(--theme-color);
    --neutral-fill-input-hover: var(--theme-color);
    --neutral-fill-input-active: var(--theme-color);
    --neutral-fill-input-focus: var(--theme-color);
    background: var(--theme-color);
    color: white;
    border: none;
  }

  @media(prefers-color-scheme: light) {
    fluent-card{
      --neutral-foreground-rest: black;
    }

    fluent-text-area, fluent-text-area::part(control), fluent-select::part(control), fluent-select::part(listbox) {
      --neutral-fill-input-rest: var(--theme-color);
      --neutral-fill-input-hover: var(--theme-color);
      --neutral-fill-input-active: var(--theme-color);
      --neutral-fill-input-focus: var(--theme-color);
      background: var(--theme-color);
      color: black;
      border: none;
    }
  }
`;