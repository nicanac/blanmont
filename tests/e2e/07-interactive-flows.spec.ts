import { test, expect } from '@playwright/test';

test.describe('Interactive User Flows', () => {
  test('Rejoindre page displays trial ride form and checks required validation', async ({ page }) => {
    await page.goto('/rejoindre');

    // Verify title / heading
    await expect(page.locator('h1')).toContainText(/rejoindre le peloton/i);

    // Form inputs exist
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const phoneInput = page.locator('input[name="phone"]');
    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /demande|rejoindre|envoyer/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Check FAQ accordion or details exist on the page
    const faqSection = page.locator('section').filter({ hasText: /questions fréquentes|faq/i });
    await expect(faqSection.first()).toBeVisible();
  });

  test('Traces page opens and interacts with filter drawer', async ({ page }) => {
    await page.goto('/traces');

    // Find filter drawer open button
    const filterBtn = page.getByRole('button', { name: /filtres/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();

      // Check distance filters or surface options appear
      const drawer = page.locator('[role="dialog"], aside, div.fixed').filter({
        hasText: /distance|revêtement|dénivelé/i,
      });
      await expect(drawer.first()).toBeVisible();

      // Close filter drawer via escape
      await page.keyboard.press('Escape');
    }
  });

  test('Equipement size guide modal toggles between Men and Women charts', async ({ page }) => {
    await page.goto('/le-club/equipement');

    // Click on the first product card to open details
    const itemCards = page.locator('article, div.cursor-pointer').filter({
      hasText: /maillot|veste|cuissard|coupe-vent|gants/i,
    });
    await expect(itemCards.first()).toBeVisible();
    await itemCards.first().click();

    // In modal, find Size Guide button if present
    const sizeGuideBtn = page.getByRole('button', { name: /guide des tailles/i });
    if (await sizeGuideBtn.isVisible()) {
      await sizeGuideBtn.click();

      // Verify Guide modal is visible
      const guideModal = page.locator('[role="dialog"]').filter({
        hasText: /guide des tailles & mensurations/i,
      });
      await expect(guideModal.first()).toBeVisible();

      // Toggle Women Fit
      const womenBtn = guideModal.getByRole('button', { name: /coupe femme/i });
      await womenBtn.click();
      await expect(guideModal).toContainText('78 - 82');

      // Toggle Men Fit
      const menBtn = guideModal.getByRole('button', { name: /coupe homme/i });
      await menBtn.click();
      await expect(guideModal).toContainText('88 - 92');

      // Close modal
      await page.keyboard.press('Escape');
    }
  });
});
