import { expect, test, type Page } from '@playwright/test';

async function cleanPage(page: Page, width = 1440, height = 1100) {
  await page.setViewportSize({ width, height });
  await page.goto('/nhap-lieu');
  await page.evaluate(() => {
    localStorage.removeItem('oneflow-form');
    localStorage.setItem('oneflow-nhap-lieu-guide:v1', 'done');
  });
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Thiết kế biểu mẫu' })).toBeVisible();
}

test('P0: validation, calculations, persistent dedupe and reporting', async ({ page }) => {
  await cleanPage(page);
  await page.getByRole('tab', { name: 'Nhập phiếu' }).click();

  await page.getByLabel('Khách hàng').fill('');
  await page.getByLabel('Số lượng').fill('-2');
  await page.getByLabel('Chiết khấu').fill('101');
  await page.getByRole('button', { name: 'Kiểm tra & lưu phiếu' }).first().click();
  await expect(page.getByRole('alert')).toContainText('Chưa thể lưu');
  await expect(page.getByRole('alert')).toContainText('Khách hàng là thông tin bắt buộc');
  await expect(page.getByRole('alert')).toContainText('Số lượng phải từ 1 trở lên');
  await expect(page.getByRole('alert')).toContainText('Chiết khấu không được vượt quá 100');
  await expect(page.getByText(/Đã lưu phiếu/)).toHaveCount(0);

  await page.getByLabel('Khách hàng').fill('Công ty kiểm thử');
  await page.getByLabel('Số lượng').fill('12');
  await page.getByLabel('Chiết khấu').fill('5');
  await expect(page.getByText('15.675.000 ₫').first()).toBeVisible();
  await page.getByRole('button', { name: 'Kiểm tra & lưu phiếu' }).first().click();
  await expect(page.getByText(/Đã lưu phiếu PBH-/)).toBeVisible();
  const savedText = await page.getByText(/Đã lưu phiếu PBH-/).textContent();
  const code = savedText?.match(/PBH-\d+/)?.[0];
  expect(code).toBeTruthy();

  await page.getByRole('button', { name: 'Kiểm tra & lưu phiếu' }).first().click();
  await expect(page.getByText(/Nội dung này đã được lưu thành phiếu/)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Kiểm tra & lưu phiếu' }).first().click();
  await expect(page.getByText(new RegExp(`đã được lưu thành phiếu ${code}`))).toBeVisible();

  await page.getByRole('link', { name: /Báo cáo/ }).first().click();
  await expect(page.getByRole('cell', { name: code! })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Công ty kiểm thử' })).toBeVisible();
});

test('P1: palette drag/drop, field settings and editable formula tokens', async ({ page }) => {
  await cleanPage(page);
  await expect(page.locator('.field-cell')).toHaveCount(11);
  const cardsBefore = await page.locator('.field-cell').count();
  const openLibrary = page.getByRole('button', { name: '+ Thêm trường' });
  if (await openLibrary.isVisible()) await openLibrary.click();
  const handle = page.getByRole('button', { name: 'Kéo Văn bản vào biểu mẫu' });
  const canvas = page.locator('.builder-end-drop');
  await handle.dragTo(canvas);
  await expect(page.locator('.field-cell')).toHaveCount(cardsBefore + 1);
  await expect(page.getByLabel('Cấu hình trường')).toContainText('VĂN BẢN');
  await page.getByLabel('Bắt buộc nhập').check();
  await page.getByLabel('Tên trường').fill('Mã tham chiếu');

  const closeInspector = page.getByRole('button', { name: 'Đóng thuộc tính' });
  if (await closeInspector.isVisible()) await closeInspector.click();
  await page.getByRole('button', { name: 'ƒx Tổng thanh toán' }).click();
  await expect(page.getByText('Công thức hiện tại')).toBeVisible();
  const token = page.getByTitle('Bấm để chọn và thay thế').first();
  const secondToken = page.getByTitle('Bấm để chọn và thay thế').nth(1);
  await token.dragTo(secondToken);
  await expect(page.getByTitle('Bấm để chọn và thay thế').first()).toHaveText('−');
  await page.getByTitle('Bấm để chọn và thay thế').nth(1).dragTo(page.getByTitle('Bấm để chọn và thay thế').first());
  await token.click();
  await expect(page.getByText(/Đang chọn token 1/)).toBeVisible();
  await page.getByPlaceholder('Hằng số, ví dụ 7,5').fill('2.5');
  await page.getByRole('button', { name: 'Thêm số' }).click();
  await expect(page.getByRole('button', { name: '2.5' })).toBeVisible();
  await page.getByLabel('Loại kết quả').selectOption('number');
  await page.getByLabel('Số lẻ').fill('2');
  await expect(page.getByRole('complementary', { name: 'Setup công thức' })).toContainText(',50');
});

test('workspace uses independent scrolling and adaptive drawers', async ({ page }) => {
  await cleanPage(page, 1600, 900);
  const palette = page.locator('.builder-palette');
  const canvas = page.locator('.builder-canvas-pane');
  const inspector = page.locator('.inspector-panel');

  await expect(page.getByRole('button', { name: '+ Thêm trường' })).toBeHidden();
  const initial = await page.evaluate(() => ({
    body: document.documentElement.scrollTop,
    canvas: document.querySelector<HTMLElement>('.builder-canvas-pane')?.scrollTop,
    inspector: document.querySelector<HTMLElement>('.inspector-panel')?.scrollTop,
  }));
  await palette.evaluate((element) => { element.scrollTop = 260; });
  await expect.poll(() => palette.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await canvas.evaluate((element) => element.scrollTop)).toBe(initial.canvas);
  expect(await inspector.evaluate((element) => element.scrollTop)).toBe(initial.inspector);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(initial.body);

  await canvas.evaluate((element) => { element.scrollTop = 240; });
  await expect.poll(() => canvas.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await palette.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
});

test('drawer keeps form building and long formula settings usable at 1280x720', async ({ page }) => {
  await cleanPage(page, 1280, 720);
  const canvas = page.locator('.builder-canvas-pane');
  await expect(page.getByRole('button', { name: '+ Thêm trường' })).toBeVisible();
  await expect(page.locator('.builder-drawer-layer--left')).toBeHidden();
  await page.getByRole('button', { name: '+ Thêm trường' }).click();
  await expect(page.getByRole('button', { name: 'Đóng thư viện trường' })).toBeVisible();
  await expect(canvas).toBeVisible();
  await page.getByRole('button', { name: 'Aa Văn bản Tên khách hàng, ghi chú' }).click();
  await expect(page.getByLabel('Cấu hình trường')).toBeVisible();
  await page.getByRole('button', { name: 'Đóng thuộc tính' }).click();

  await page.getByRole('button', { name: 'ƒx Tổng thanh toán' }).click();
  const inspector = page.locator('.inspector-panel');
  await expect(inspector).toBeVisible();
  const headerTop = await page.locator('.inspector-header').evaluate((element) => element.getBoundingClientRect().top);
  const tokenBox = await page.getByTitle('Bấm để chọn và thay thế').first().boundingBox();
  const inspectorBox = await inspector.boundingBox();
  expect(tokenBox && inspectorBox).toBeTruthy();
  await page.mouse.move(tokenBox!.x + tokenBox!.width / 2, tokenBox!.y + tokenBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(tokenBox!.x + tokenBox!.width / 2 + 10, tokenBox!.y + tokenBox!.height / 2 + 10);
  await page.mouse.move(inspectorBox!.x + inspectorBox!.width / 2, inspectorBox!.y + inspectorBox!.height - 12, { steps: 18 });
  await page.waitForTimeout(250);
  await page.mouse.up();
  await expect.poll(() => inspector.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
  await inspector.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(page.getByLabel('Loại kết quả')).toBeVisible();
  expect(await page.locator('.inspector-header').evaluate((element) => element.getBoundingClientRect().top)).toBe(headerTop);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
});

test('low-height and 125% zoom keep workspace controls reachable', async ({ page }) => {
  await cleanPage(page, 1366, 768);
  await expect(page.getByRole('button', { name: '+ Thêm trường' })).toBeVisible();
  let dimensions = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: innerHeight, width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.height).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.clientWidth + 1);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { document.body.style.zoom = '1.25'; });
  await expect(page.getByRole('button', { name: '+ Thêm trường' })).toBeVisible();
  dimensions = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: innerHeight, width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await page.evaluate(() => { document.body.style.zoom = ''; });
});

for (const [width, height] of [[1920, 1080], [1600, 900], [1440, 900], [1366, 768], [1280, 800], [1280, 720], [1024, 768], [768, 800], [390, 844]] as const) {
  test(`responsive ${width}x${height} has no horizontal page overflow`, async ({ page }) => {
    await cleanPage(page, width, height);
    await expect(page.getByRole('tab', { name: 'Thiết kế biểu mẫu' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    if (width >= 768) {
      const vertical = await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, clientHeight: document.documentElement.clientHeight }));
      expect(vertical.scrollHeight).toBeLessThanOrEqual(vertical.clientHeight + 1);
    }
    await page.screenshot({ path: `output/playwright/nhap-lieu-${width}x${height}.png`, fullPage: width < 768, animations: 'disabled' });
  });

  test(`entry workspace ${width}x${height} keeps controls usable`, async ({ page }) => {
    await cleanPage(page, width, height);
    await page.getByRole('tab', { name: 'Nhập phiếu' }).click();
    await expect(page.getByLabel('Khách hàng')).toBeVisible();
    await expect(page.getByLabel('Ngày bán')).toHaveAttribute('type', 'date');
    await expect(page.getByLabel('Sản phẩm')).toHaveRole('combobox');
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    await page.screenshot({ path: `output/playwright/nhap-lieu-entry-${width}x${height}.png`, fullPage: true, animations: 'disabled' });
  });
}
