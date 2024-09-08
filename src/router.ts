// docs for router https://github.com/thepassle/app-tools/blob/master/router/README.md

import { html } from 'lit';

if (!(globalThis as any).URLPattern) {
  await import("urlpattern-polyfill");
}

// @ts-ignore
import { Router } from '@thepassle/app-tools/router.js';
// @ts-ignore
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';

import './pages/app-home/app-home.js';

const baseURL: string = (import.meta as any).env.BASE_URL;

export const router = new Router({
    routes: [
      {
        path: "/",
        title: 'Home',
        render: () => html`<app-home></app-home>`
      },
      {
        path: resolveRouterPath('voice'),
        title: 'Voice',
        plugins: [
          lazy(() => import('./pages/app-voice/app-voice.js')),
        ],
        render: () => html`<app-voice></app-voice>`
      },
      {
        path: resolveRouterPath('convo'),
        title: 'Conversation',
        plugins: [
          lazy(() => import('./pages/app-convo.js')),
        ],
        render: () => html`<app-convo></app-convo>`
      },
      {
        path: resolveRouterPath('photo'),
        title: 'Photo',
        plugins: [
          lazy(() => import('./pages/app-image/app-image.js')),
        ],
        render: () => html`<app-image></app-image>`
      },
      {
        path: resolveRouterPath('pro'),
        title: 'Pro',
        plugins: [
          lazy(() => import('./pages/app-pro/app-pro.js')),
        ],
        render: () => html`<app-pro></app-pro>`
      },
      {
        path: resolveRouterPath('success'),
        title: 'Success',
        plugins: [
          lazy(() => import('./pages/app-success.js')),
        ],
        render: () => html`<app-success></app-success>`
      },
      {
        path: resolveRouterPath('manage'),
        title: 'Manage',
        plugins: [
          lazy(() => import('./pages/app-manage.js')),
        ],
        render: () => html`<app-manage></app-manage>`
      },
      {
        path: resolveRouterPath('about'),
        title: 'About',
        plugins: [
          lazy(() => import('./pages/app-about/app-about.js')),
        ],
        render: () => html`<app-about></app-about>`
      }
    ]
  });

  // This function will resolve a path with whatever Base URL was passed to the vite build process.
  // Use of this function throughout the starter is not required, but highly recommended, especially if you plan to use GitHub Pages to deploy.
  // If no arg is passed to this function, it will return the base URL.

  export function resolveRouterPath(unresolvedPath?: string) {
    var resolvedPath = baseURL;
    if(unresolvedPath) {
      resolvedPath = resolvedPath + unresolvedPath;
    }

    return resolvedPath;
  }
