import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login } from "./helpers/auth";

test.describe("setup / first admin", () => {
  test("redirects to /setup when no user exists and creates admin", async ({ page }) => {
    await resetDb(page);
    // Visiting / should redirect to /setup (needsSetup=true) via src/app/page.tsx:6
    await page.goto("/");
    await expect(page).toHaveURL(/\/setup/);
    await expect(page.getByRole("heading", { name: /first-time setup/i })).toBeVisible();

    const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };
    await createAdminViaSetup(page, admin);

    // After setup, /setup should redirect to /login (src/app/setup/page.tsx:7)
    await page.goto("/setup");
    await expect(page).toHaveURL(/\/login/);

    // Login as admin works
    await login(page, admin.email, admin.password);
    await expect(page.locator("header").getByText("Admin").first()).toBeVisible();
  });

  test("dashboard redirects to /setup when DB empty", async ({ page }) => {
    await page.request.post("/api/test/reset");
    await page.goto("/books");
    await expect(page).toHaveURL(/\/setup/);
  });
});
