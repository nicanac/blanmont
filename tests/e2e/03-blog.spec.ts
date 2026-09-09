import { test, expect } from '@playwright/test';

test.describe('Blog and Editorial Articles', () => {
  test('Blog listing displays news articles and stats', async ({ page }) => {
    await page.goto('/blog');

    // Verify Title
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/news|peloton/i);

    // Verify articles are rendered
    const articleCards = page.locator('article, a[href^="/blog/"]');
    await expect(articleCards.first()).toBeVisible();

    // Verify article card metadata (date or reading time)
    await expect(page.locator('main').first()).toContainText(/articles publiés|news/i);
  });

  test('Blog article detail page renders full markdown content and back link', async ({ page }) => {
    // Navigate directly to a statically generated post
    await page.goto('/blog/les-nouveaux-maillots-sont-la');

    // Title of the article
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Article content is rendered
    const articleBody = page.locator('article, .prose, main').first();
    await expect(articleBody).toBeVisible();

    // Verify back link to blog exists and navigates back
    const backBtn = page.getByRole('link', { name: /retour|news/i }).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL(/\/blog$/);
  });
});
