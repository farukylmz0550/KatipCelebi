import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

test.describe("manual GUI", () => {
  test("full flow: setup → books → lending → people → stats → achievements → leaderboard → admin → i18n/theme", async ({ page }) => {
    await resetDb(page);
    // 1. Setup (needsSetup true → /setup)
    await page.goto("/");
    await expect(page).toHaveURL(/\/setup/);
    await page.getByPlaceholder("Admin name").fill("ManualAdmin");
    await page.getByPlaceholder("Admin email").fill("manual@katip.test");
    await page.getByPlaceholder(/Admin password/i).fill("password123");
    await page.getByRole("button", { name: /create admin account/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.screenshot({ path: "e2e/screenshots/01-setup-login.png", fullPage: true });

    // 2. Login as admin
    await page.getByPlaceholder("Email").fill("manual@katip.test");
    await page.getByPlaceholder("Password").fill("password123");
    await page.getByRole("button", { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/books/);
    await expect(page.locator("header").getByText("ManualAdmin").first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/02-books-empty.png", fullPage: true });

    // 3. Add book
    await page.getByPlaceholder("Title").fill("Manual Book One");
    await page.getByPlaceholder("Author").fill("Author One");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Manual Book One").first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/03-book-added.png", fullPage: true });

    // 4. Add second book and check filter
    await page.getByPlaceholder("Title").fill("History of Time");
    await page.getByPlaceholder("Author").fill("Stephen Hawking");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("History of Time").first()).toBeVisible();
    await page.getByPlaceholder("Search").fill("History");
    await expect(page.getByText("History of Time").first()).toBeVisible();
    await expect(page.getByText("Manual Book One").first()).toBeHidden();
    await page.getByPlaceholder("Search").fill("");
    await page.screenshot({ path: "e2e/screenshots/04-filter.png", fullPage: true });

    // 5. Book detail
    await page.locator("a[href^='/books/']").first().click();
    await expect(page.getByRole("heading", { name: /facts/i })).toBeVisible();
    await page.getByRole("button", { name: /^edit$/i }).click();
    await page.getByLabel("Subtitle").fill("A Brief History");
    await page.getByRole("button", { name: /^save$/i }).first().click();
    await expect(page.getByText("A Brief History")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/05-book-detail.png", fullPage: true });

    // 6. Lending
    await page.goto("/lending");
    await page.locator("select").first().selectOption({ index: 0 });
    await page.getByPlaceholder("Borrower name").fill("Test Friend");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await expect(page.getByText("Test Friend")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/06-lending.png", fullPage: true });

    // 7. People
    await page.goto("/people");
    await expect(page.getByText("Test Friend")).toBeVisible();
    await page.getByPlaceholder("Person name").fill("New Person");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("New Person")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/07-people.png", fullPage: true });

    // 8. Stats
    await page.goto("/stats");
    await expect(page.getByRole("heading", { name: /reading stats|okuma istatistikleri/i })).toBeVisible();
    await expect(page.getByText(/total books|toplam kitap/i).first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/08-stats.png", fullPage: true });

    // 9. Achievements
    await page.goto("/achievements");
    await expect(page.getByText("First Book", { exact: true })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/09-achievements.png", fullPage: true });

    // 10. Leaderboard
    await page.goto("/leaderboard");
    await expect(page.getByText("ManualAdmin").first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/10-leaderboard.png", fullPage: true });

    // 11. Admin covers (admin only)
    await page.goto("/admin/covers");
    await expect(page.getByRole("heading", { name: /cover cache/i })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/11-admin.png", fullPage: true });

    // 12. i18n + theme
    await page.goto("/books");
    await page.locator("header").getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading", { name: /kitaplarım/i })).toBeVisible();
    await page.getByLabel("Toggle theme").click();
    await page.screenshot({ path: "e2e/screenshots/12-i18n-theme.png", fullPage: true });

    // 13. Excel template download
    await page.goto("/books");
    const [dl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /^template$/i }).click(),
    ]);
    expect(dl.suggestedFilename()).toBe("isbn_list.xlsx");
  });
});
