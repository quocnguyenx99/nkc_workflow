import { expect, test, type Locator, type Page } from '@playwright/test';

async function resetGuide(page: Page, dismissed: boolean) {
  await page.goto('/nhap-lieu');
  await page.evaluate((isDismissed) => {
    localStorage.removeItem('oneflow-form');
    if (isDismissed) localStorage.setItem('oneflow-nhap-lieu-guide:v1', 'done');
    else localStorage.removeItem('oneflow-nhap-lieu-guide:v1');
  }, dismissed);
  await page.reload();
}

async function expectSystemScrollbar(locator: Locator) {
  await expect(locator).toHaveClass(/\bsystem-scrollbar\b/);
  await locator.page().mouse.move(0, 0);
  const style = await locator.evaluate((element) => {
    const current = getComputedStyle(element);
    const webkit = getComputedStyle(element, '::-webkit-scrollbar');
    const thumb = getComputedStyle(element, '::-webkit-scrollbar-thumb');
    const track = getComputedStyle(element, '::-webkit-scrollbar-track');
    return {
      standardWidth: current.scrollbarWidth,
      standardColor: current.scrollbarColor,
      webkitWidth: webkit.width,
      webkitHeight: webkit.height,
      thumb: thumb.backgroundColor,
      track: track.backgroundColor,
    };
  });

  // Chromium/Edge use the WebKit branch so thumb hover remains available.
  expect(style.webkitWidth).toBe('8px');
  expect(style.webkitHeight).toBe('8px');
  expect(style.thumb).toBe('rgb(209, 213, 219)');
  expect(style.track).toBe('rgb(243, 244, 246)');
  expect(style.standardWidth).toBe('auto');
  expect(style.standardColor).toBe('auto');
}

test('all builder scroll panes use the shared scrollbar without changing overflow behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await resetGuide(page, true);

  const sidebar = page.locator('.app-sidebar .system-scrollbar');
  const header = page.locator('.app-header-actions');
  const palette = page.locator('.builder-palette');
  const canvas = page.locator('.builder-canvas-pane');
  const inspector = page.locator('.inspector-panel');

  for (const target of [sidebar, header, palette, canvas, inspector]) {
    await expectSystemScrollbar(target);
  }

  const overflow = await page.evaluate(() => {
    const read = (selector: string) => {
      const style = getComputedStyle(document.querySelector(selector)!);
      return [style.overflowX, style.overflowY];
    };
    return {
      palette: read('.builder-palette'),
      canvas: read('.builder-canvas-pane'),
      inspector: read('.inspector-panel'),
      page: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
    };
  });

  expect(overflow.palette[1]).toBe('auto');
  expect(overflow.canvas).toEqual(['auto', 'auto']);
  expect(overflow.inspector[1]).toBe('auto');
  expect(overflow.page[0]).toBeLessThanOrEqual(overflow.page[1] + 1);
});

test('document, responsive drawer, guide, report scrollers and textarea share one scrollbar skin', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetGuide(page, false);

  const rootStyle = await page.evaluate(() => {
    const webkit = getComputedStyle(document.documentElement, '::-webkit-scrollbar');
    return {
      width: webkit.width,
      track: getComputedStyle(document.documentElement, '::-webkit-scrollbar-track').backgroundColor,
      thumb: getComputedStyle(document.documentElement, '::-webkit-scrollbar-thumb').backgroundColor,
    };
  });
  expect(rootStyle).toEqual({ width: '8px', track: 'rgb(243, 244, 246)', thumb: 'rgb(209, 213, 219)' });

  await page.locator('.first-run-summary button[aria-expanded]').click();
  await expectSystemScrollbar(page.locator('.first-run-popover'));
  await page.locator('.first-run-summary button[aria-expanded]').click();

  await page.locator('.builder-compact-toolbar button').first().click();
  const drawerPalette = page.locator('.builder-palette');
  await expectSystemScrollbar(drawerPalette);
  await expect.poll(() => drawerPalette.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);

  await page.goto('/bao-cao');
  const progress = page.locator('[aria-label="Tiến trình báo cáo"]');
  const tableScroller = page.locator('table').locator('..');
  const textarea = page.locator('#bc-note');
  for (const target of [page.locator('.app-sidebar .system-scrollbar'), page.locator('.app-header-actions'), progress, tableScroller, textarea]) {
    await expectSystemScrollbar(target);
  }

  const reportOverflow = await page.evaluate(() => {
    const progressElement = document.querySelector<HTMLElement>('[aria-label="Tiến trình báo cáo"]')!;
    const tableElement = document.querySelector('table')!.parentElement!;
    return {
      progress: [getComputedStyle(progressElement).overflowX, progressElement.scrollWidth > progressElement.clientWidth],
      table: [getComputedStyle(tableElement).overflowX, tableElement.scrollWidth > tableElement.clientWidth],
      page: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
    };
  });
  expect(reportOverflow.progress).toEqual(['auto', true]);
  expect(reportOverflow.table).toEqual(['auto', true]);
  expect(reportOverflow.page[0]).toBeLessThanOrEqual(reportOverflow.page[1] + 1);
});
