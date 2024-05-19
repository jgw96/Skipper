/*
  A script that uses playwright to quickly generate screenshots
  for my Web App Manifest
*/

import { chromium, Page } from 'playwright';

async function generateScreenshots() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('http://localhost:3002');

    await setUpApp(page);

    // emulate ipad air in landscape mode
    await page.setViewportSize({ width: 1024, height: 768 });

    await standardScreenshots(page, "desktop");

    // set viewport size to a pixel 8
    await page.setViewportSize({ width: 412, height: 915 });

    await standardScreenshots(page, "mobile");

    await browser.close();
}

async function standardScreenshots(page: Page, platform: "desktop" | "mobile") {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await sendChat(page);

    await page.waitForTimeout(2000);
    await page.screenshot({ path: `public/assets/screenshots/chat-dark-${platform}.png` });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.screenshot({ path: `public/assets/screenshots/chat-light-${platform}.png` });

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: `public/assets/screenshots/home-dark-${platform}.png` });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: `public/assets/screenshots/home-light-${platform}.png` });
}

async function setUpApp(page: Page) {
    const fluentInput = page.locator('#intro-content-block fluent-text-field[id="gpt-api-key"] input');

    // Type an API key into the input.
    await fluentInput.fill('sk-proj-jUOsovil2mp2TiUSLxcdT3BlbkFJDXJ1EcWvt5jipczcoJdf');

    await page.locator('sl-dialog[label="Hello"] key-manager fluent-button').click();
  }


async function sendChat(page: Page) {
    await page.route((url) => url.href.includes("sendchatwithactions"), async route => {
        const json = {
            "id": "chatcmpl-9QTUm9ezolWujORg5rnWa4aO4l5jb",
            "choices": [
                {
                    "message": {
                        "content": "The current weather at your location is 45.7°F, and it is clear with no rain.",
                        "role": "assistant"
                    },
                    "finish_reason": "stop",
                    "index": 0
                }
            ],
            "created": 1716096936,
            "model": "gpt-4-turbo-2024-04-09",
            "object": "chat.completion"
        }
        await route.fulfill({ json });
    });

    const chatInput = await page.locator('#input-block fluent-text-area textarea');
    await chatInput.fill('What time is it');

    const responsePromise = page.waitForResponse(response => response.url().includes('sendchatwithactions'));
    await page.locator('#big-time-button').click();

    await responsePromise;
}

generateScreenshots();