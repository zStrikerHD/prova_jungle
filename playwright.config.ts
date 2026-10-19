import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'e2e-desktop',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'e2e-mobile',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 5'], channel: 'chrome' },
    },
    {
      name: 'visual-desktop',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'visual-mobile',
      testDir: './tests/visual',
      use: { ...devices['Pixel 5'], channel: 'chrome' },
    },
  ],
  webServer: process.env.PW_SKIP_SERVER ? undefined : {
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5199 --strictPort',
    url: 'http://127.0.0.1:5199',
    reuseExistingServer: false,
  },
})
