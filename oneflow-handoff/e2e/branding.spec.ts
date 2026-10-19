import { expect, test } from '@playwright/test';

test('NKC OneFlow logo is shared across product, home and interface preview', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ['/', '/nhap-lieu', '/bao-cao', '/giao-dien']) {
    await page.goto(path);
    await expect(page.locator('[aria-label="NKC OneFlow"]').first()).toBeVisible();
    await expect(page.getByText('LOGO', { exact: true })).toHaveCount(0);
  }

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
});

test('mobile product shell keeps the logo symbol visible without crowding navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/nhap-lieu');
  const brand = page.locator('.app-sidebar-brand [aria-label="NKC OneFlow"]');
  await expect(brand).toBeVisible();
  await expect(brand.locator('svg')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
