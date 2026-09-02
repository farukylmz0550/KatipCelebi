import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup } from "./helpers/auth";

test.describe("setup / first admin", () => {
  test("redirects to /setup when no user exists and creates admin", async ({ page }) => {
    await resetDb(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/setup/);
    await expect(page.getByRole("button", { name: /create admin account/i })).toBeVisible();

    const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };
    await createAdminViaSetup(page, admin);

    await page.goto("/setup");
    await expect(page).toHaveURL(/\/login/);

    const { login } = await import("./helpers/auth");
    await login(page, admin.email, admin.password);
    await expect(page.locator("header").getByText("Admin").first()).toBeVisible();
  });

  test("dashboard redirects to /setup when DB empty", async ({ page }) => {
    await resetDb(page);
    await page.goto("/books");
    await expect(page).toHaveURL(/\/setup/);
  });
});
