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

test('Form Workspace preview is clean, calculated and preserves the active design draft', async ({ page }) => {
  await cleanV6(page);
  await expect(page.getByRole('button', { name: 'Mở rộng Form Workspace' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Chỉnh công thức Tổng thanh toán' }).click();
  await page.getByLabel('Tên công thức').fill('Tổng thanh toán đang sửa');

  const previewButton = page.getByRole('button', { name: 'Xem trước' });
  await expect(previewButton).toBeVisible();
  await previewButton.click();
  const dialog = page.getByRole('dialog', { name: 'Phiếu bán hàng' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Công ty TNHH Minh Phát')).toBeVisible();
  await expect(dialog.getByText('15.675.000 ₫')).toHaveCount(2);
  await expect(dialog.locator('.entry-cell')).toHaveCount(11);
  await expect(dialog.getByText('Tổng thanh toán đang sửa')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /sửa|kéo|xóa/i })).toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Tên công thức')).toHaveValue('Tổng thanh toán đang sửa');
  await expect(previewButton).toBeFocused();
});

test('Form Workspace preview is full-screen friendly on mobile', async ({ page }) => {
  await cleanV6(page, 390, 844);
  await page.getByRole('button', { name: '4. Form' }).click();
  await page.getByRole('button', { name: 'Xem trước' }).click();
  const dialog = page.getByRole('dialog', { name: 'Phiếu bán hàng' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Quay lại thiết kế' })).toBeVisible();
  const bounds = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.height).toBeLessThanOrEqual(844);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await dialog.getByRole('button', { name: 'Quay lại thiết kế' }).click();
  await expect(dialog).toHaveCount(0);
});

test('formula definition can be created in the unified editor, placed, detached and restored after reload', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: '+ Công thức mới' }).click();
  await page.getByLabel('Tên công thức').fill('Thành tiền thử');
  await expect(page.getByRole('tab', { name: /Cơ bản|Nâng cao/ })).toHaveCount(0);
  const fieldSearch = page.getByPlaceholder('Tìm trường để chèn…');
  await fieldSearch.fill('so luong');
  await expect(page.getByRole('button', { name: 'Chèn trường Số lượng' })).toBeVisible();
  await fieldSearch.press('Enter');
  await page.getByRole('button', { name: 'Chèn Nhân' }).click();
  await fieldSearch.fill('don gia');
  await fieldSearch.press('Enter');
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

test('direct formula input supports keyboard autocomplete, paste, live validation and token sync', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: 'Chỉnh công thức Tổng thanh toán' }).click();
  const input = page.getByRole('combobox', { name: 'Nhập công thức' });
  const savedTokens = await page.evaluate(() => JSON.parse(localStorage.getItem('oneflow-form')!).state.fields.find((field: { id: string }) => field.id === 'f4').tokens);

  await input.fill('[');
  await expect(page.getByRole('group', { name: /Dữ liệu/ })).toBeVisible();
  const formulaGroup = page.getByRole('group', { name: /Công thức/ });
  await expect(formulaGroup).toBeVisible();
  await expect(formulaGroup.getByRole('option', { name: /Thành tiền/ })).toBeVisible();
  await expect(formulaGroup.getByRole('option', { name: /Tổng thanh toán/ })).toHaveAttribute('aria-disabled', 'true');
  await input.press('Escape');

  await input.fill('thanh t');
  await input.press('Enter');
  await expect(input).toHaveValue('[Thành tiền]');
  await expect(page.getByRole('complementary', { name: 'Setup công thức' }).getByText('15.000.000 ₫', { exact: true })).toBeVisible();

  await input.fill('don');
  await expect(page.getByRole('listbox', { name: 'Gợi ý trường công thức' })).toBeVisible();
  await input.press('Escape');
  await expect(page.getByRole('listbox', { name: 'Gợi ý trường công thức' })).toHaveCount(0);
  await input.fill('so lu');
  await expect(page.getByRole('option', { name: /Số lượng/ })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('[Số lượng]');
  await input.press('End');
  await input.pressSequentially(' * don g');
  await expect(page.getByRole('option', { name: /Đơn giá/ })).toBeVisible();
  await input.press('Tab');
  await expect(input).toHaveValue('[Số lượng] * [Đơn giá]');
  const setup = page.getByRole('complementary', { name: 'Setup công thức' });
  await expect(setup.getByText('15.000.000 ₫', { exact: true })).toBeVisible();

  await input.fill('=([Số lượng] + 4) / 2');
  await expect(setup.getByText('8 ₫', { exact: true })).toBeVisible();
  await input.fill('([Số lượng] + 3) /');
  await expect(page.getByRole('alert')).toContainText('sau phép tính cuối');
  await expect(page.getByRole('button', { name: 'Áp dụng', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('oneflow-form')!).state.fields.find((field: { id: string }) => field.id === 'f4').tokens)).toEqual(savedTokens);

  await page.getByRole('button', { name: 'Xóa công thức' }).click();
  await page.getByRole('button', { name: 'Chèn trường Số lượng' }).click();
  await page.getByRole('button', { name: 'Chèn Nhân' }).click();
  await page.getByRole('button', { name: 'Chèn trường Đơn giá' }).click();
  await expect(input).toHaveValue('[Số lượng] * [Đơn giá]');
});

test('formula autocomplete keeps cycle-causing formulas visible but prevents using them', async ({ page }) => {
  await cleanV6(page);
  await page.getByRole('button', { name: 'Chỉnh công thức Thành tiền' }).click();
  const input = page.getByRole('combobox', { name: 'Nhập công thức' });
  await input.fill('[');
  const dependent = page.getByRole('option', { name: /Tiền chiết khấu.*Tạo vòng tham chiếu/ });
  await expect(dependent).toBeVisible();
  await expect(dependent).toHaveAttribute('aria-disabled', 'true');

  await input.fill('[Tiền chiết khấu]');
  await expect(page.getByRole('complementary', { name: 'Setup công thức' })).toContainText('tham chiếu vòng');
  await expect(page.getByRole('button', { name: 'Áp dụng', exact: true })).toBeDisabled();
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
  await page.getByRole('button', { name: 'Mở trường công thức', exact: true }).click();
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
