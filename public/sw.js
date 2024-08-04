import { skipWaiting, clientsClaim } from 'workbox-core';
import { CacheFirst } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

skipWaiting();
clientsClaim();

self.addEventListener('fetch', (fetchEvent) => {
    if (fetchEvent.request.url.endsWith('/receive-files/') && fetchEvent.request.method === 'POST') {
        return fetchEvent.respondWith(
            (async () => {
                const formData = await fetchEvent.request.formData();
                const image = formData.get('image');
                const keys = await caches.keys();
                const mediaCache = await caches.open(keys.filter((key) => key.startsWith('media'))[0]);
                await mediaCache.put('shared-image', new Response(image));
                return Response.redirect('./?share-target', 303);
            })(),
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

registerRoute(
    ({ url }) => url.pathname.includes("workbox"),
    new CacheFirst({
        cacheName: 'workbox-cache',
    })
);

registerRoute(
    ({ url }) => url.pathname.includes("cdn.jsdelivr.net"),
    new CacheFirst({
        cacheName: 'cdn-cache',
    })
)

registerRoute(
    ({ url }) => url.pathname.includes(".webp"),
    new CacheFirst({
        cacheName: 'webp-cache',
    })
)

// widgets
// Listen to the widgetinstall event.
self.addEventListener("widgetinstall", event => {
    // The widget just got installed, render it using renderWidget.
    // Pass the event.widget object to the function.
    event.waitUntil(renderWidget(event.widget));
});

async function renderWidget(widget) {
    // Get the template and data URLs from the widget definition.
    const templateUrl = widget.definition.msAcTemplate;
    const dataUrl = widget.definition.data;

    // Fetch the template text and data.
    const template = await (await fetch(templateUrl)).text();
    const data = await (await fetch(dataUrl)).text();

    // Render the widget with the template and data.
    await self.widgets.updateByTag(widget.definition.tag, { template, data });
}

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, above the `precacheAndRoute` line.
precacheAndRoute(self.__WB_MANIFEST || []);