import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login } from "./helpers/auth";

test.describe("stats / gamification / achievements / leaderboard / excel / i18n / theme", () => {
  const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await resetDb(page);
    await createAdminViaSetup(page, admin);
    await login(page, admin.email, admin.password);
  });

  test("stats page shows level/xp and goal progress", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("Stats Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Stats Book", { exact: true }).first()).toBeVisible();

    await page.goto("/stats");
    await expect(page.getByText("Level")).toBeVisible();

    await page.getByPlaceholder("Target").first().fill("10");
    await page.getByRole("button", { name: /^set$/i }).first().click();
    await expect(page.getByPlaceholder("Target").first()).toHaveValue("10");

    await page.goto("/books");
    await page.getByRole("button", { name: /mark finished/i }).first().click();
    await page.goto("/stats");
    await expect(page.getByText("Finished")).toBeVisible();
  });

  test("achievements unlock", async ({ page }) => {
    await page.goto("/achievements");
    await expect(page.getByText("First Book", { exact: true })).toBeVisible();

    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("Ach Book 1");
    await page.getByPlaceholder("Author").fill("Author A");
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.goto("/achievements");
    await expect(page.getByText("First Book").first()).toBeVisible();

    await page.goto("/books");
    await page.getByRole("button", { name: /mark finished/i }).first().click();
    await page.goto("/achievements");
    await expect(page.getByText("Bookworm Beginnings")).toBeVisible();

    await page.goto("/lending");
    await page.getByPlaceholder("Name").fill("Test Friend");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await page.goto("/achievements");
    await expect(page.getByText("Generous Reader")).toBeVisible();
  });

  test("leaderboard shows self highlighted", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.getByText("Leaderboard")).toBeVisible();
    await expect(page.getByText("Admin").first()).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  });

  test("i18n locale switch", async ({ page }) => {
    await page.goto("/books");
    await expect(page.getByText("Books", { exact: true }).first()).toBeVisible();
    await page.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByText("Collection").first()).toBeVisible();
    await page.locator("header").getByRole("button", { name: /TR/i }).click();
    await page.locator("header").getByRole("button", { name: /ES/i });
  });

  test("theme toggle dark/light", async ({ page }) => {
    await page.goto("/books");
    const html = page.locator("html");
    const initial = await html.getAttribute("class");
    await page.getByLabel("Toggle theme").click();
    await expect.poll(async () => await html.getAttribute("class")).not.toEqual(initial);
  });

  test("excel: template download, export", async ({ page }) => {
    await page.goto("/books");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /^template$/i }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("isbn_list.xlsx");

    await page.getByPlaceholder("Title").first().fill("Excel Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Excel Book", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: /^export$/i }).click();
    await expect(page.getByRole("button", { name: /^export$/i })).toBeVisible();
  });

  test("admin covers page requires admin", async ({ page }) => {
    await page.goto("/admin/covers");
    await expect(page.getByRole("heading", { name: /cover cache/i })).toBeVisible();
  });

  test("non-admin cannot access admin covers", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Your name").fill("Normal");
    await page.getByPlaceholder("you@example.com").fill("normal@katip.test");
    await page.getByPlaceholder("Min 8 characters").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await login(page, "normal@katip.test", "password123");
    await page.goto("/admin/covers");
    await expect(page.getByText(/forbidden|admin only/i)).toBeVisible();
  });
});
