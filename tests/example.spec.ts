import { test, expect, Page } from '@playwright/test';

let baseURL = 'https://www.cloudwithchris.com';

// Annotate entire file as serial.
test.describe.configure({ mode: 'parallel' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});


test('runs in parallel 1', async ({ page }) => {
  await page.goto(baseURL);
  const title = page.locator('#navbarSupportedContent > .navbar-nav > li');
  await expect(title).toHaveCount(7);
});

/*

test('runs first', async () => {
  await page.goto('https://playwright.dev/');
});

test('runs second', async () => {
  await page.click('text=Get Started');
});

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.cloudwithchris.com');
});

test('Navigation Check', async ({ page }) => {
  const title = page.locator('#navbarSupportedContent > .navbar-nav > li');
  await expect(title).toHaveCount(7);
});

test('Social button Check', async ({ page }) => {
  const title = page.locator('.social-box > div > div > div');
  await expect(title).toHaveCount(6);
});

test('Number of items on homepage', async ({ page }) => {
  const title = page.locator('.bg-main > div > div > div > .col-md-6');
  await expect(title).toHaveCount(10);
});*/