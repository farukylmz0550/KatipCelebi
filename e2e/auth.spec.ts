import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login, register, logout } from "./helpers/auth";

test.describe("auth", () => {
  const admin = { name: "Admin", email: "admin@katip.test", password: "password123" };
  const user = { name: "Faruk", email: "faruk@katip.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await resetDb(page);
    await createAdminViaSetup(page, admin);
  });

  test("register → login → logout guard", async ({ page }) => {
    await register(page, user);
    await login(page, user.email, user.password);
    await expect(page.getByText("Books", { exact: true }).first()).toBeVisible();
    await logout(page);
    await page.goto("/books");
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("nope@katip.test");
    await page.getByPlaceholder("••••••••").fill("wrongpass");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("register duplicate email blocked", async ({ page }) => {
    await register(page, user);
    await page.goto("/register");
    await page.getByPlaceholder("Your name").fill(user.name);
    await page.getByPlaceholder("you@example.com").fill(user.email);
    await page.getByPlaceholder("Min 8 characters").fill(user.password);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/already registered/i)).toBeVisible();
  });

  test("register blocked when needsSetup", async ({ page }) => {
    await resetDb(page);
    await page.goto("/register");
    await expect(page).toHaveURL(/\/setup/);
  });
});
