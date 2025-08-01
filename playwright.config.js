import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Use the dev server
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:3001',
  },
  testDir: './tests',
  timeout: 30000,
});