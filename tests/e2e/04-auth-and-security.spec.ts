import { test, expect } from '@playwright/test';

test.describe('Authentication, Account Activation, and Security Access', () => {
  test('Login page renders standard credentials form', async ({ page }) => {
    await page.goto('/login');

    // Verify title / heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Verify email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible();

    // Verify submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('First-time activation tab enforces member verification', async ({ page }) => {
    await page.goto('/login');

    // Locate activation tab button
    const activationTab = page.locator('button').filter({
      hasText: /1ère connexion|première connexion|activer/i,
    }).first();

    await expect(activationTab).toBeVisible();
    await activationTab.click();

    // Check member-only warning banner
    const warningBanner = page.locator('div, p').filter({
      hasText: /réservé aux membres inscrits au club/i,
    });
    await expect(warningBanner.first()).toBeVisible();

    // Fill an unregistered email address
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('stranger_test_unregistered@not-a-member-domain.be');

    // Submit activation request
    const activateBtn = page.locator('button[type="submit"]').filter({
      hasText: /activer|envoyer/i,
    }).first();
    await activateBtn.click();

    // Verify error notification / message
    const errorMsg = page.locator('div, p, [role="status"], [role="alert"]').filter({
      hasText: /pas enregistrée dans l'annuaire|non reconnu|erreur/i,
    });
    await expect(errorMsg.first()).toBeVisible({ timeout: 15000 });
  });

  test('Forgot password page renders email input and submit', async ({ page }) => {
    await page.goto('/login/forgot-password');

    // Email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Submit button exists
    const submitBtn = page.locator('button[type="submit"]').or(
      page.getByRole('button', { name: /envoyer|réinitialiser/i })
    );
    await expect(submitBtn.first()).toBeVisible();

    // Back to login link exists
    const loginLink = page.getByRole('link', { name: /connexion|retour/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('Admin routes require authentication and redirect unauthorized visitors', async ({ page }) => {
    // Attempt to access /admin directly without session
    await page.goto('/admin');

    // Expect redirection to login with redirect query param
    await expect(page).toHaveURL(/\/login(\?redirect=.*)?$/, { timeout: 15000 });
  });

  test('Admin members management requires authentication', async ({ page }) => {
    // Attempt to access /admin/members directly without session
    await page.goto('/admin/members');

    // Expect redirection to login
    await expect(page).toHaveURL(/\/login(\?redirect=.*)?$/, { timeout: 15000 });
  });
});
