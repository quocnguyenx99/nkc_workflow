import { expect, test, type Page } from '@playwright/test';

async function cleanV6(page: Page, width = 1920, height = 1080) {
  await page.setViewportSize({ width, height });
  await page.goto('/nhap-lieu');
  await page.evaluate(() => {
    localStorage.removeItem('oneflow-form');
    localStorage.removeItem('oneflow-form:v2-backup');
    localStorage.setItem('oneflow-builder-version', 'v6');
    localStorage.setItem('oneflow-nhap-lieu-guide:v1', 'done');
  });
  await page.reload();
  await expect(page.getByRole('region', { name: 'Form Workspace' })).toBeVisible();
}

test('V6 desktop uses four ordered work areas and 1440 keeps a usable Form beside Setup', async ({ page }) => {
  await cleanV6(page);
  const areas = await page.locator('.v6-builder-grid > *').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().left));
  expect(areas).toEqual([...areas].sort((left, right) => left - right));
  await expect(page.getByRole('complementary', { name: 'Trường dữ liệu' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Trường công thức' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Setup công thức' })).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: 'Mở trường dữ liệu', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mở trường công thức', exact: true })).toBeVisible();
  const formWidth = await page.getByRole('region', { name: 'Form Workspace' }).evaluate((element) => element.getBoundingClientRect().width);
  expect(formWidth).toBeGreaterThanOrEqual(560);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('formula definition can be created, edited in Basic mode, placed, detached and restored after reload', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: '+ Công thức mới' }).click();
  await page.getByLabel('Tên công thức').fill('Thành tiền thử');
  const basicSelects = page.locator('.v6-basic-editor select');
  await basicSelects.nth(0).selectOption({ label: 'Số lượng' });
  await basicSelects.nth(1).selectOption('×');
  await basicSelects.nth(2).selectOption({ label: 'Đơn giá' });
  await expect(page.getByRole('complementary', { name: 'Setup công thức' })).toContainText('15.000.000 ₫');
  await page.getByRole('button', { name: 'Áp dụng', exact: true }).click();

  const formula = page.locator('.v6-formula-item').filter({ hasText: 'Thành tiền thử' });
  await expect(formula).toContainText('Hợp lệ');
  await formula.getByRole('button', { name: '+ Form' }).click();
  await expect(page.locator('.field-cell')).toHaveCount(12);
  await formula.getByRole('button', { name: 'Bỏ' }).click();
  await expect(page.locator('.field-cell')).toHaveCount(11);
  await expect(formula).toBeVisible();
  await page.reload();
  await expect(page.locator('.v6-formula-item').filter({ hasText: 'Thành tiền thử' })).toContainText('Hợp lệ');
  await expect(page.locator('.field-cell')).toHaveCount(11);
});

test('Formula Workspace preserves an unapplied draft and Cancel restores committed data', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: 'Chỉnh công thức Tổng thanh toán' }).click();
  await page.getByLabel('Tên công thức').fill('Tổng thanh toán đang sửa');
  await page.getByRole('button', { name: 'Mở Formula Workspace' }).click();
  await expect(page.getByRole('region', { name: 'Formula Workspace' })).toContainText('Tổng thanh toán đang sửa');
  await page.getByRole('button', { name: 'Quay lại bốn cột' }).click();
  await expect(page.getByLabel('Tên công thức')).toHaveValue('Tổng thanh toán đang sửa');
  await page.getByRole('button', { name: 'Hủy thay đổi' }).click();
  await expect(page.getByLabel('Tên công thức')).toHaveValue('Tổng thanh toán');
});

test('v2 local state is backed up and migrated idempotently to formOrder', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: 'Aa Khách hàng' }).click();
  await page.getByLabel('Tên trường').fill('Khách hàng legacy');
  await page.getByRole('button', { name: 'Đóng thuộc tính' }).click();
  await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem('oneflow-form')!);
    envelope.version = 2;
    delete envelope.state.formOrder;
    envelope.state.sel = 'stale-selection';
    envelope.state.seq = 0;
    envelope.state.legacyFlag = 'keep-me';
    localStorage.setItem('oneflow-form', JSON.stringify(envelope));
    localStorage.removeItem('oneflow-form:v2-backup');
  });
  await page.reload();
  const state = await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem('oneflow-form')!);
    const backup = JSON.parse(localStorage.getItem('oneflow-form:v2-backup')!);
    return { current, backup };
  });
  expect(state.backup.version).toBe(2);
  expect(state.current.version).toBe(3);
  expect(state.current.state.formOrder).toEqual(state.current.state.fields.map((field: { id: string }) => field.id));
  expect(state.current.state.sel).toBeNull();
  expect(state.current.state.seq).toBeGreaterThanOrEqual(1);
  expect(state.current.state.legacyFlag).toBe('keep-me');
  const firstOrder = state.current.state.formOrder;
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('oneflow-form')!).state.formOrder)).toEqual(firstOrder);
});

test('mobile uses a single-pane, tap-first field flow', async ({ page }) => {
  await cleanV6(page, 390, 844);
  await page.getByRole('button', { name: '1. Dữ liệu' }).click();
  await expect(page.getByRole('complementary', { name: 'Trường dữ liệu' })).toBeVisible();
  await page.getByRole('button', { name: 'Aa Văn bản Tên khách hàng, ghi chú' }).click();
  await expect(page.getByRole('complementary', { name: 'Cấu hình trường' })).toBeVisible();
  await expect(page.locator('.field-cell')).toHaveCount(12);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('V5 renderer remains available as the feature-flag rollback path', async ({ page }) => {
  await cleanV6(page, 1440, 900);
  await page.getByRole('button', { name: '+ Công thức mới' }).click();
  await page.evaluate(() => localStorage.setItem('oneflow-builder-version', 'v5'));
  await page.reload();
  await expect(page.locator('.builder-workspace')).toBeVisible();
  await expect(page.locator('.v6-builder-grid')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '+ Thêm trường' })).toBeVisible();
  await expect(page.locator('.field-cell')).toHaveCount(12);
  await page.getByRole('tab', { name: 'Nhập phiếu' }).click();
  await expect(page.locator('.entry-cell')).toHaveCount(12);
});
