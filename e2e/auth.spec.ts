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
    // register new non-admin (src/app/actions/auth.ts:14 zod + bcrypt)
    await register(page, user);
    // login with new user
    await login(page, user.email, user.password);
    await expect(page.getByRole("heading", { name: /my books|kitaplarım/i })).toBeVisible();

    // logout via dashboard layout form (src/app/(dashboard)/layout.tsx:78 signOut)
    await logout(page);

    // unauthenticated guard: /books → /login (src/proxy.ts:13)
    await page.goto("/books");
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("nope@katip.test");
    await page.getByPlaceholder("Password").fill("wrongpass");
    await page.getByRole("button", { name: /^log in$/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("register duplicate email blocked", async ({ page }) => {
    await register(page, user);
    await page.goto("/register");
    await page.getByPlaceholder("Name").fill(user.name);
    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder(/Password/i).fill(user.password);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/already registered/i)).toBeVisible();
  });

  test("register blocked when needsSetup", async ({ page }) => {
    await resetDb(page);
    await page.goto("/register");
    // src/app/register/page.tsx:6 redirects to /setup when needsSetup
    await expect(page).toHaveURL(/\/setup/);
  });
});
