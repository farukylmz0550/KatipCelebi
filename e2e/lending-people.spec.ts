import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login } from "./helpers/auth";

test.describe("lending + people", () => {
  const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await resetDb(page);
    await createAdminViaSetup(page, admin);
    await login(page, admin.email, admin.password);
    // seed two books
    await page.goto("/books");
    await page.getByPlaceholder("Title").fill("Book One");
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.getByPlaceholder("Title").fill("Book Two");
    await page.getByRole("button", { name: /^add$/i }).click();
  });

  test("create lending (person auto-create, XP+5) and return", async ({ page }) => {
    await page.goto("/lending");
    // LendingForm (src/app/(dashboard)/lending/lending-form.tsx:6)
    await page.locator("select").first().selectOption({ index: 0 });
    await page.getByPlaceholder("Borrower name").fill("Ayşe Yılmaz");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await expect(page.getByText("Ayşe Yılmaz")).toBeVisible();
    // return
    await page.getByRole("button", { name: /mark returned/i }).first().click();
    await expect(page.getByText("Returned")).toBeVisible();
  });

  test("copies guard: All copies are out", async ({ page }) => {
    // set copies=1 (default) and lend twice should fail second
    await page.goto("/lending");
    await page.locator("select").first().selectOption({ index: 0 });
    await page.getByPlaceholder("Borrower name").fill("Person A");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await expect(page.getByText("Person A")).toBeVisible();

    // second lend same book should error (src/app/actions/lending.ts:28)
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("All copies are out");
      await dialog.accept();
    });
    // via book detail lending (copies aware)
    await page.goto("/books");
    await page.locator("a[href^='/books/']").first().click();
    await page.getByPlaceholder("Borrower name").fill("Person B");
    await page.getByRole("button", { name: /^lend$/i }).click();
  });

  test("people: create, trust score, history, delete guard", async ({ page }) => {
    await page.goto("/people");
    // PersonForm (src/app/(dashboard)/people/person-form.tsx:7)
    await page.getByPlaceholder("Person name").fill("Mehmet");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Mehmet")).toBeVisible();
    // trust = returned - out (src/lib/person.ts:18) initially 0
    await expect(page.getByText("0").first()).toBeVisible();

    // duplicate normalized should fail (src/app/actions/people.ts:17)
    await page.getByPlaceholder("Person name").fill("mehmet");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible();

    // create lending to this person then try delete -> blocked (src/app/actions/people.ts:31 out>0)
    await page.goto("/lending");
    await page.getByPlaceholder("Borrower name").fill("Mehmet");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await page.goto("/people");
    await page.getByRole("link", { name: "Mehmet" }).click();
    // history section visible (src/app/(dashboard)/people/page.tsx:75)
    await expect(page.getByText(/history for mehmet/i)).toBeVisible();
    await page.getByRole("button", { name: /remove/i }).click();
    await expect(page.getByText(/still has books out/i)).toBeVisible();

    // return then delete succeeds
    await page.goto("/lending");
    await page.getByRole("button", { name: /mark returned/i }).first().click();
    await page.goto("/people");
    await page.getByRole("link", { name: "Mehmet" }).click();
    await page.getByRole("button", { name: /remove/i }).click();
    await expect(page.getByText("Mehmet")).toBeHidden();
  });

  test("lending via book detail with datalist", async ({ page }) => {
    await page.goto("/books");
    await page.locator("a[href^='/books/']").first().click();
    // BookLending datalist persons (book-lending.tsx:61)
    await page.getByPlaceholder("Borrower name").fill("New Person");
    await page.getByRole("button", { name: /^lend$/i }).click();
    await expect(page.getByText("New Person")).toBeVisible();
    await page.getByRole("button", { name: /take back/i }).click();
    await expect(page.getByText("(out)")).toBeHidden();
  });
});
