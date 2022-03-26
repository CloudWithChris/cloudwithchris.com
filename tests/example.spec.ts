import { test, expect, Page } from '@playwright/test';

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
});
