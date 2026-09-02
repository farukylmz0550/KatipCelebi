import { expect, type Page } from "@playwright/test";

export async function createAdminViaSetup(page: Page, admin: { name: string; email: string; password: string }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto("/setup");
    try {
      await expect(page.getByRole("button", { name: /create admin account/i })).toBeVisible({ timeout: 3000 });
      break;
    } catch {
      await page.request.post("/api/test/reset").catch(() => {});
      try {
        const { execSync } = await import("node:child_process");
        execSync("python3 -c \"import sqlite3; conn=sqlite3.connect('prisma/dev.db'); conn.execute('PRAGMA busy_timeout=5000'); conn.executescript('DELETE FROM UserAchievement; DELETE FROM LendingRecord; DELETE FROM Book; DELETE FROM Person; DELETE FROM Goal; DELETE FROM User;'); conn.commit(); conn.close()\"", { stdio: "ignore" });
      } catch {}
      await new Promise((r) => setTimeout(r, 700));
      if (attempt === 2) throw new Error("setup form not visible after reset");
    }
  }
  await page.getByPlaceholder("Your name").fill(admin.name);
  await page.getByPlaceholder("you@example.com").fill(admin.email);
  await page.getByPlaceholder("Min 8 characters").fill(admin.password);
  await page.getByRole("button", { name: /create admin account/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/books/, { timeout: 10000 });
}

export async function register(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto("/register");
  await page.getByPlaceholder("Your name").fill(user.name);
  await page.getByPlaceholder("you@example.com").fill(user.email);
  await page.getByPlaceholder("Min 8 characters").fill(user.password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
