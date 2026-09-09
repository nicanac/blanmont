import { test, expect } from '@playwright/test';

test.describe('Navigation and Public Pages', () => {
  test('Homepage loads with branding, hero, and navigation', async ({ page }) => {
    await page.goto('/');

    // Verify title and main logo
    await expect(page).toHaveTitle(/blanmont/i);
    await expect(page.getByRole('link', { name: /blanmont/i }).first()).toBeVisible();

    // Verify Cover Hero title
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/rouler ensemble/i);

    // Verify main nav links are visible on desktop
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Calendrier', exact: true }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Membres', exact: true }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Les News', exact: true }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sondage Weekend', exact: true }).first()).toBeVisible();

    // Verify footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Calendrier page loads agenda and controls', async ({ page }) => {
    await page.goto('/calendrier');

    // Check heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/calendrier/i);

    // Check that calendar container or sorties list is rendered
    await expect(page.locator('main').first()).toBeVisible();

    // Check subscription / export button
    const subscribeBtn = page.getByRole('button', { name: /s'abonner|synchroniser|calendrier/i }).or(
      page.getByRole('link', { name: /s'abonner|synchroniser|calendrier/i })
    );
    await expect(subscribeBtn.first()).toBeVisible();
  });

  test('Le Club page presents the club history and groups', async ({ page }) => {
    await page.goto('/le-club');

    // Heading "L'Esprit du Peloton"
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/peloton|club/i);

    // Presentation text and sections
    await expect(page.locator('main').first()).toContainText(/brabant wallon|club cyclo/i);

    // Groups section with captains
    const groupsSection = page.locator('section, div').filter({ hasText: /groupes de niveau|capitaines/i });
    await expect(groupsSection.first()).toBeVisible();

    // Link to calendar or contact
    const actionLink = page.getByRole('link', { name: /calendrier|contacter/i }).first();
    await expect(actionLink).toBeVisible();
  });

  test('Equipement page loads boutique catalog and opens item modal', async ({ page }) => {
    await page.goto('/le-club/equipement');

    // Heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/équipement|boutique|collection/i);

    // Categories filter pills exist
    await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible();

    // Equipment items exist
    const itemCards = page.locator('article, div.cursor-pointer').filter({ hasText: /maillot|veste|cuissard|coupe-vent|gants/i });
    await expect(itemCards.first()).toBeVisible();

    // Click on the first product card to open modal detail
    await itemCards.first().click();

    // Modal dialog is displayed
    const modal = page.locator('div[role="dialog"], div.fixed.inset-0').filter({ hasText: /commander|taille|référence/i });
    await expect(modal.first()).toBeVisible();

    // Close modal via escape
    await page.keyboard.press('Escape');
  });

  test('Members page displays directory and search filtering', async ({ page }) => {
    await page.goto('/members');

    // Title / heading
    await expect(page.locator('h1')).toContainText(/peloton|membres/i);

    // Search input
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();

    // Members list renders
    const memberCards = page.locator('article, div').filter({ hasText: /capitaine|comité|président|trésorier|secrétaire|membre/i });
    await expect(memberCards.first()).toBeVisible();

    // Search for a specific string
    await searchInput.fill('Laurent');
    // Ensure search input value is reflected
    await expect(searchInput).toHaveValue('Laurent');
  });

  test('Leaderboard page loads ranking challenges', async ({ page }) => {
    await page.goto('/leaderboard');

    // Title or heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/carré vert|classement|leaderboard/i);

    // Check main container
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('Sondage weekend page loads poll view', async ({ page }) => {
    await page.goto('/sondage');

    // Title or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/sondage|weekend|peloton/i);
  });
});
