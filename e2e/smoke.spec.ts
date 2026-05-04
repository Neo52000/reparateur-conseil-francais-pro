import { test, expect } from '@playwright/test';

/**
 * Smoke tests — vérifie que les pages publiques critiques rendent
 * sans erreur et exposent les balises SEO de base. Aucune dépendance DB.
 */

test('home page renders + has SEO meta', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);

  await expect(page).toHaveTitle(/TopRéparateurs/i);

  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description).toBeTruthy();
  expect(description!.length).toBeGreaterThan(50);

  await expect(page.locator('h1').first()).toBeVisible();
});

test('search page loads', async ({ page }) => {
  const response = await page.goto('/search');
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/recherche|search|réparateur/i);
});

test('blog index loads', async ({ page }) => {
  const response = await page.goto('/blog');
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/blog/i);
});

test('legal pages reachable', async ({ page }) => {
  for (const path of ['/legal-notice', '/privacy', '/terms', '/cookies']) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should not 404`).toBeLessThan(400);
  }
});

test('repairer auth + plans pages reachable', async ({ page }) => {
  for (const path of ['/repairer-auth', '/repairer-plans']) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should not 404`).toBeLessThan(400);
  }
});

test('subscription return URLs render', async ({ page }) => {
  await page.goto('/subscription-canceled');
  await expect(page.getByRole('heading', { name: /paiement annulé/i })).toBeVisible();

  await page.goto('/subscription-success');
  await expect(page.getByRole('heading')).toBeVisible();
});

test('hreflang and canonical present on home', async ({ page }) => {
  await page.goto('/');
  const hreflangFr = await page.locator('link[hreflang="fr-FR"]').count();
  const canonical = await page.locator('link[rel="canonical"]').count();
  expect(hreflangFr).toBeGreaterThan(0);
  expect(canonical).toBeGreaterThan(0);
});
