import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login } from "./helpers/auth";

test.describe("books", () => {
  const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await resetDb(page);
    await createAdminViaSetup(page, admin);
    await login(page, admin.email, admin.password);
  });

  test("add book via form (addBook → XP+5)", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("Dune");
    await page.getByPlaceholder("Author").fill("Frank Herbert");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Dune", { exact: true }).first()).toBeVisible();
    await expect(page.locator("a[href^='/books/']").first()).toBeVisible();
  });

  test("ISBN lookup + add", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("ISBN").fill("9780140449136");
    await page.getByRole("button", { name: /look up/i }).click();
    await page.waitForTimeout(1500);
    await page.getByPlaceholder("Title").first().fill("The Odyssey");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.locator("a[href^='/books/']").first()).toBeVisible();
  });

  test("bulk import by ISBN", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("One ISBN per line").fill("9780140449136, 9780306406157");
    await page.getByRole("button", { name: /import/i }).click();
    await expect(page.getByPlaceholder("One ISBN per line")).toBeVisible();
  });

  test("filter bar: search + rating + status + lent + tag + sort", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("A History Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("A History Book", { exact: true }).first()).toBeVisible();
    await page.getByPlaceholder("Title").first().fill("Science Fiction Epic");
    await page.getByPlaceholder("Author").fill("Author X");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Science Fiction Epic", { exact: true }).first()).toBeVisible();

    await page.getByPlaceholder("Search by title, author, ISBN...").fill("History");
    await expect(page.getByText("A History Book", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Science Fiction Epic", { exact: true }).first()).toBeHidden();

    await page.getByPlaceholder("Search by title, author, ISBN...").fill("");
    await page.getByRole("button", { name: /filters/i }).click();
    await page.locator("select").filter({ hasText: "Status" }).selectOption("TO_READ");
    await expect(page.getByText(/0 of 2|of 2/).first()).toBeVisible();
  });

  test("book detail: facts edit + personal (rating/signed/tags/notes) + copies", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("Detail Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Detail Book", { exact: true }).first()).toBeVisible();
    await page.locator("a[href^='/books/']").first().click();
    await expect(page.getByRole("heading", { name: /facts/i })).toBeVisible();

    await page.getByRole("button", { name: /^edit$/i }).click();
    await page.getByLabel("Subtitle").fill("Sub");
    await page.getByRole("button", { name: /^save$/i }).first().click();
    await expect(page.getByText("Sub", { exact: true }).first()).toBeVisible();

    await page.locator("button:has-text('★')").nth(2).click();
    await page.getByLabel("Signed").check();
    await expect(page.getByLabel("Signed")).toBeChecked();

    await page.getByPlaceholder("e.g. fiction, history").fill("fiction, history");
    await page.getByRole("button", { name: /^save$/i }).first().click();
    await expect(page.getByText(/Fiction, History/)).toBeVisible();

    await page.locator('input[type="number"]').fill("3");
    await page.getByRole("button", { name: /^save$/i }).last().click();
    await expect(page.getByText(/3 copies/)).toBeVisible();
  });
});
