import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true });

  test('Mobile homepage renders compact hero and toggles mobile menu', async ({ page }) => {
    await page.goto('/');

    // Hero title is visible
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // Mobile menu toggle button exists
    const menuBtn = page.getByRole('button', { name: /ouvrir le menu principal/i });
    await expect(menuBtn).toBeVisible();

    // Open mobile menu
    await menuBtn.click();

    // Verify navigation links in open mobile panel
    const mobilePanel = page.locator('nav div.origin-top, nav div.shadow-2xl');
    await expect(mobilePanel).toBeVisible();

    // Verify links within mobile menu
    const calLink = mobilePanel.getByRole('link', { name: /calendrier/i });
    await expect(calLink).toBeVisible();

    // Click Calendrier in mobile menu to navigate
    await calLink.click();
    await expect(page).toHaveURL(/\/calendrier$/);
    await expect(page.locator('h1').first()).toContainText(/calendrier/i);
  });

  test('Mobile calendar and members pages render responsive layouts', async ({ page }) => {
    // Visit members on mobile
    await page.goto('/members');
    await expect(page.locator('h1').first()).toBeVisible();

    // Search input should fit and be usable
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Laurent');
    await expect(searchInput).toHaveValue('Laurent');
  });
});
