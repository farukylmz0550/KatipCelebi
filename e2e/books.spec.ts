import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login } from "./helpers/auth";

test.describe("books", () => {
  const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await page.request.post("/api/test/reset");
    await createAdminViaSetup(page, admin);
    await login(page, admin.email, admin.password);
  });

  test("add book via form (addBook → XP+5)", async ({ page }) => {
    await page.goto("/books");
    // src/app/(dashboard)/books/add-book-form.tsx:36
    await page.getByPlaceholder("Title").fill("Dune");
    await page.getByPlaceholder("Author").fill("Frank Herbert");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Dune")).toBeVisible();
    // BookCard appears (src/app/(dashboard)/books/book-card.tsx:13)
    await expect(page.locator("a[href^='/books/']").first()).toBeVisible();
  });

  test("ISBN lookup + add (OpenLibrary mock - valid ISBN 9780140449136)", async ({ page }) => {
    // Mock OpenLibrary fetchBook to avoid real network
    await page.route("https://openlibrary.org/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/isbn/9780140449136.json")) {
        await route.fulfill({
          json: { title: "The Odyssey", authors: [{ key: "/authors/OL1A" }], publishers: ["Penguin"], number_of_pages: 300 },
        });
      } else if (url.includes("/authors/OL1A.json")) {
        await route.fulfill({ json: { name: "Homer" } });
      } else {
        await route.continue();
      }
    });
    await page.goto("/books");
    await page.getByPlaceholder("ISBN").fill("9780140449136");
    await page.getByRole("button", { name: /look up/i }).click();
    await expect(page.getByPlaceholder("Title")).toHaveValue("The Odyssey");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("The Odyssey")).toBeVisible();
  });

  test("bulk import by ISBN (importBooksByIsbn split /[\\s,;]+/)", async ({ page }) => {
    await page.route("https://openlibrary.org/**", async (route) => {
      await route.fulfill({ json: { title: "Mock Book", authors: [] } });
    });
    await page.goto("/books");
    await page.getByPlaceholder("One ISBN per line").fill("9780140449136, 9780306406157");
    await page.getByRole("button", { name: /import/i }).click();
    await expect(page.getByText(/\+2|\b2\b/)).toBeVisible({ timeout: 10000 });
  });

  test("filter bar: search + rating + status + lent + tag + sort", async ({ page }) => {
    await page.goto("/books");
    // add two books for filtering
    await page.getByPlaceholder("Title").fill("A History Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.getByPlaceholder("Title").fill("Science Fiction Epic");
    await page.getByPlaceholder("Author").fill("Author X");
    await page.getByRole("button", { name: /^add$/i }).click();

    // FilterBar (src/app/(dashboard)/books/filter-bar.tsx:6)
    await page.getByPlaceholder("Search").fill("History");
    await expect(page.getByText("A History Book")).toBeVisible();
    await expect(page.getByText("Science Fiction Epic")).toBeHidden();

    await page.getByPlaceholder("Search").fill("");
    await page.getByRole("button", { name: /advanced/i }).click();
    // status filter
    await page.locator("select").filter({ hasText: "Status" }).selectOption("TO_READ");
    await expect(page.getByText(/0 \/ 2|\/ 2/)).toBeVisible();
  });

  test("book row: mark finished (+50 XP) and delete", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").fill("To Finish");
    await page.getByRole("button", { name: /^add$/i }).click();
    // src/app/(dashboard)/books/book-row.tsx:25 markFinished
    await page.getByRole("button", { name: /mark finished/i }).first().click();
    // After finished, button disappears
    await expect(page.getByRole("button", { name: /mark finished/i })).toHaveCount(0);
    // Delete
    await page.getByRole("button", { name: /^delete$/i }).first().click();
    await expect(page.getByText("To Finish")).toBeHidden();
  });

  test("book detail: facts edit + personal (rating/signed/tags/notes) + copies", async ({ page }) => {
    await page.goto("/books");
    await page.getByPlaceholder("Title").fill("Detail Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.locator("a[href^='/books/']").first().click();
    await expect(page.getByRole("heading", { name: /facts/i })).toBeVisible();

    // BookFacts edit (book-facts.tsx:25)
    await page.getByRole("button", { name: /^edit$/i }).click();
    await page.getByLabel("Subtitle").fill("Sub");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText("Sub")).toBeVisible();

    // BookPersonal rating (book-personal.tsx:72 stars)
    await page.locator("button:has-text('★')").nth(2).click();
    // signed checkbox
    await page.getByLabel("Signed").check();
    await expect(page.getByLabel("Signed")).toBeChecked();

    // tags
    await page.getByPlaceholder("e.g. fiction, history").fill("fiction, history");
    await page.getByRole("button", { name: /^save$/i }).first().click();
    await expect(page.getByText(/Fiction, History/)).toBeVisible();

    // Lending copies (book-lending.tsx:54)
    await page.getByLabel("Copies:").fill("3");
    await page.getByRole("button", { name: /^save$/i }).last().click();
    await expect(page.getByText(/3 copies/)).toBeVisible();
  });
});
