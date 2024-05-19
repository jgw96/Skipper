import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('has loaded', async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Home/);
});

test('can set up application', async ({ page }) => {
  await setUpApp(page);

  const mainDialog = await page.locator('sl-dialog[label="Hello"]');
  await expect(mainDialog).not.toHaveAttribute('open');
});

test('Can send chat', async ({ page }) => {
  await setUpApp(page);

  await sendChat(page);
});

test('Can send chat and then start new chat', async ({ page }) => {
  await setUpApp(page);

  await sendChat(page);

  await page.locator('#saved #new-convo').click();

  await expect(page.locator('#suggested')).toBeVisible();
});

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

  await expect(page.locator("li.assistant")).toContainText("The current weather at your location is 45.7°F, and it is clear with no rain.");
}

async function setUpApp(page: Page) {
  const fluentInput = page.locator('#intro-content-block fluent-text-field[id="gpt-api-key"] input');

  // Expect the initial value of the key input to be empty.
  await expect(fluentInput).toHaveValue('');

  // Type an API key into the input.
  await fluentInput.fill('sk-proj-jUOsovil2mp2TiUSLxcdT3BlbkFJDXJ1EcWvt5jipczcoJdf');

  await page.locator('sl-dialog[label="Hello"] key-manager fluent-button').click();
}
