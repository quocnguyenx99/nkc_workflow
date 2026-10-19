import { expect, test } from '@playwright/test';

test('approved report still generates XLSX, DOCX and PPTX files', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/bao-cao');
  await page.evaluate(() => localStorage.removeItem('oneflow-report'));
  await page.reload();
  await page.getByRole('button', { name: 'Phê duyệt', exact: true }).click();
  await expect(page.getByText('Đã mở khoá')).toBeVisible();

  const formats = [
    { option: /XLSX Excel/, button: 'Xuất file Excel', extension: '.xlsx' },
    { option: /DOCX Word/, button: 'Xuất file Word', extension: '.docx' },
    { option: /PPTX PowerPoint/, button: 'Xuất file PowerPoint', extension: '.pptx' },
  ];

  for (const format of formats) {
    await page.getByRole('button', { name: format.option }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: format.button }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().endsWith(format.extension)).toBe(true);
    await expect(page.getByRole('status')).toContainText('Đã tạo');
  }
});
