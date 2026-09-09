import { test, expect } from '@playwright/test';

test.describe('Traces, Saturday Ride, and Activity Import', () => {
  test('Traces catalogue displays curated traces and filtering', async ({ page }) => {
    await page.goto('/traces');

    // Hero / Title
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/traces|parcours|circuits/i);

    // Filter controls or sort options exist
    const sortOrFilter = page.locator('button, select').filter({ hasText: /trier|filtres|plus récents|distance/i });
    await expect(sortOrFilter.first()).toBeVisible();

    // Trace cards are rendered
    const traceCards = page.locator('article, div').filter({ hasText: /km|d\+|départ/i });
    await expect(traceCards.first()).toBeVisible();
  });

  test('Trace detail page loads route stats and download action', async ({ page }) => {
    // Navigate to a known static trace
    await page.goto('/traces/trace_12338a3128914ee4b788916553028046');

    // Check title / heading is present
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check distance / elevation badges exist
    await expect(page.locator('main').first()).toContainText(/km/i);

    // Check GPX download button or map action
    const actionBtn = page.getByRole('button', { name: /télécharger le gpx|gpx/i }).or(
      page.getByRole('link', { name: /carte interactive|voir/i })
    );
    await expect(actionBtn.first()).toBeVisible();
  });

  test('Saturday Ride page displays ride information and route options', async ({ page }) => {
    await page.goto('/saturday-ride');

    // Hero title
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/saturday|samedi|ride/i);

    // Check main container renders
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('Strava import page renders connection flow', async ({ page }) => {
    await page.goto('/import/strava');

    // Page title or card heading
    await expect(page.locator('h1, h3').first()).toContainText(/strava/i);

    // Either Strava connect button or import form
    const stravaAction = page.getByRole('link', { name: /strava/i }).or(
      page.getByRole('button', { name: /strava|importer/i })
    );
    await expect(stravaAction.first()).toBeVisible();
  });

  test('Garmin import page renders file upload dropzone', async ({ page }) => {
    await page.goto('/import/garmin');

    // Heading
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();

    // File input exists
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});
