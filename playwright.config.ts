import { defineConfig, devices } from '@playwright/test';

/**
 * E2E "smoke tests" — golden path uniquement.
 * Pas une suite de regression complète : on vérifie que les pages publiques
 * critiques (home, search, fiche, blog, légal) répondent et exposent les
 * meta SEO attendues.
 *
 * Lancé localement par `npx playwright test` (le dev server est démarré
 * automatiquement via `webServer`). En CI, on peut activer ce projet sur
 * un workflow dédié si besoin (non bloquant en V1).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
