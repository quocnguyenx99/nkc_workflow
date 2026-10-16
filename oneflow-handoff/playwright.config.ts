import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 75_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:3000/nhap-lieu',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  reporter: [['list']],
});
