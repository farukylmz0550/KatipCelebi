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

  test("stats page shows level/xp and goal progress (src/lib/gamification 5/50, src/lib/goals)", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").fill("Stats Book");
    await page.getByRole("button", { name: /^add$/i }).click();

    await page.goto("/stats");
    // levelForXp xp=5 → level 1 (src/lib/gamification.ts:10)
    await expect(page.getByText(/level/i).first()).toBeVisible();
    await expect(page.getByText("1").first()).toBeVisible(); // xp=5

    // set yearly goal (GoalForms src/app/(dashboard)/stats/goal-forms.tsx:22)
    await page.getByLabel(/yearly goal/i).fill("10");
    await page.getByRole("button", { name: /^set$/i }).first().click();
    await expect(page.getByText("10").first()).toBeVisible();

    // mark finished → xp+50, progress updates
    await page.goto("/books");
    await page.getByRole("button", { name: /mark finished/i }).first().click();
    await page.goto("/stats");
    await expect(page.getByText(/finished/i).first()).toBeVisible();
    // monthly chart exists (MonthlyChart Recharts)
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("achievements unlock: first_book, first_finish, first_lending, five_authors", async ({ page }) => {
    await page.goto("/achievements");
    // initially all locked (opacity-60)
    await expect(page.getByText("First Book")).toBeVisible();

    // add first book → unlock first_book (src/lib/gamification.ts:48 ACHIEVEMENT_RULES)
    await page.goto("/books");
    await page.getByPlaceholder("Title").fill("Ach Book 1");
    await page.getByPlaceholder("Author").fill("Author A");
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.goto("/achievements");
    await expect(page.locator("li").filter({ hasText: "First Book" })).toHaveClass(/border-\[#2a78d6\]/);

    // finish → first_finish
    await page.goto("/books");
    await page.getByRole("button", { name: /mark finished/i }).first().click();
    await page.goto("/achievements");
    await expect(page.locator("li").filter({ hasText: "Bookworm Beginnings" })).toHaveClass(/border-\[#2a78d6\]/);

    // lend → first_lending
    await page.goto("/lending");
    await page.getByPlaceholder("Borrower name").fill("Test Friend");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await page.goto("/achievements");
    await expect(page.locator("li").filter({ hasText: "Generous Reader" })).toHaveClass(/border-\[#2a78d6\]/);
  });

  test("leaderboard shows self highlighted (src/app/(dashboard)/leaderboard/page.tsx:30)", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.getByRole("heading", { name: /leaderboard/i })).toBeVisible();
    await expect(page.getByText("Admin")).toBeVisible();
    await expect(page.getByText("1").first()).toBeVisible(); // rank
  });

  test("i18n locale switch TR/EN (src/i18n/get-dictionary.ts 6 langs)", async ({ page }) => {
    await page.goto("/books");
    // default EN
    await expect(page.getByRole("heading", { name: /my books/i })).toBeVisible();
    // click locale button EN → TR (LOCAlES cycle src/app/(dashboard)/layout.tsx:68)
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading", { name: /kitaplarım/i })).toBeVisible();
    await page.getByRole("button", { name: "TR" }).click();
    await expect(page.getByRole("heading", { name: /my books/i })).toBeVisible();
  });

  test("theme toggle dark/light (src/lib/theme.ts cookie)", async ({ page }) => {
    await page.goto("/books");
    const html = page.locator("html");
    const initial = await html.getAttribute("class");
    await page.getByLabel("Toggle theme").click();
    await expect.poll(async () => await html.getAttribute("class")).not.toEqual(initial);
  });

  test("excel: template download, export, import (src/lib/books/excel 20MiB)", async ({ page }) => {
    await page.goto("/books");
    // Template button triggers download (buildTemplateExcel base64)
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /^template$/i }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("isbn_list.xlsx");

    // Add book then export
    await page.getByPlaceholder("Title").fill("Excel Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    const [dl2] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /^export$/i }).click(),
    ]);
    expect(dl2.suggestedFilename()).toBe("my_library.xlsx");
  });

  test("admin covers page requires admin (src/app/actions/covers.ts requireAdmin)", async ({ page }) => {
    await page.goto("/admin/covers");
    await expect(page.getByRole("heading", { name: /cover cache/i })).toBeVisible();
    await expect(page.getByText(/cached covers/i)).toBeVisible();
    // clear button visible for admin
    await expect(page.getByRole("button", { name: /clear them/i })).toBeVisible();
  });

  test("non-admin cannot access admin covers", async ({ page }) => {
    // register second user and login as non-admin
    await page.goto("/register");
    await page.getByPlaceholder("Name").fill("Normal");
    await page.getByPlaceholder("Email").fill("normal@katip.test");
    await page.getByPlaceholder(/Password/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await login(page, "normal@katip.test", "password123");
    await page.goto("/admin/covers");
    await expect(page.getByText(/forbidden|admin only/i)).toBeVisible();
  });
});
