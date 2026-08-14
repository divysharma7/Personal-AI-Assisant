import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests/full-stack',
  outputDir: './test-results/full-stack/artifacts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: Boolean(process.env.CI),
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/full-stack', open: 'never' }],
    ['junit', { outputFile: 'test-results/full-stack/junit.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'critical-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
})
