import { expect, type Page } from "@playwright/test";

export async function createAdminViaSetup(page: Page, admin: { name: string; email: string; password: string }) {
  await page.goto("/setup");
  // If DB not empty (previous test didn't reset), try reset and retry
  try {
    await expect(page.getByRole("heading", { name: /first-time setup/i })).toBeVisible({ timeout: 2000 });
  } catch {
    await page.request.post("/api/test/reset").catch(() => {});
    await page.goto("/setup");
    await expect(page.getByRole("heading", { name: /first-time setup/i })).toBeVisible();
  }
  await page.getByPlaceholder("Admin name").fill(admin.name);
  await page.getByPlaceholder("Admin email").fill(admin.email);
  await page.getByPlaceholder(/Admin password/i).fill(admin.password);
  await page.getByRole("button", { name: /create admin account/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/books/);
}

export async function register(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto("/register");
  await page.getByPlaceholder("Name").fill(user.name);
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder(/Password/i).fill(user.password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
