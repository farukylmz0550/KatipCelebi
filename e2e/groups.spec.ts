// SPDX-License-Identifier: GPL-3.0-only
import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";
import { createAdminViaSetup, login, register, logout } from "./helpers/auth";

test.describe("groups / shelves (v2.8.0)", () => {
  const admin = { name: "Admin", email: "admin@bookshelf.test", password: "password123" };
  const userB = { name: "User B", email: "userb@bookshelf.test", password: "password123" };

  test.beforeEach(async ({ page }) => {
    await resetDb(page);
    await createAdminViaSetup(page, admin);
    await login(page, admin.email, admin.password);
  });

  async function createGroup(page: import("@playwright/test").Page, name: string, color?: string) {
    await page.goto("/groups");
    await page
      .getByRole("button", { name: /create group/i })
      .first()
      .click();
    await page.getByLabel("Group name").fill(name);
    if (color) {
      await page.getByRole("button", { name: new RegExp(color, "i") }).click();
    }
    await page
      .getByRole("button", { name: /^create$/i })
      .last()
      .click();
    await expect(page.getByRole("link", { name })).toBeVisible();
  }

  async function addCurrentBookToGroup(page: import("@playwright/test").Page, groupName: string) {
    await page.getByRole("button", { name: /add to group/i }).click();
    await page.getByRole("checkbox", { name: groupName }).click();
    await expect(page.getByText(/added to group/i)).toBeVisible();
    await expect(page.locator("section", { hasText: "Groups" }).getByText(groupName)).toBeVisible();
  }

  test("create, rename, reorder, delete groups", async ({ page }) => {
    await page.goto("/groups");
    await expect(page.getByText("No groups yet")).toBeVisible();

    await createGroup(page, "Favorites");
    await createGroup(page, "To Read");
    await expect(page.getByText("0 books").first()).toBeVisible();

    // Reorder: move "To Read" up via the accessible button on its row
    await page.getByRole("button", { name: "Move up: To Read" }).click();
    await expect(page.locator("a[href^='/groups/']").first()).toHaveText("To Read");

    // Rename
    await page.getByRole("button", { name: /rename group: to read/i }).click();
    await page.getByLabel("Group name").fill("Reading Pile");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByRole("link", { name: "Reading Pile" })).toBeVisible();

    // Duplicate name is rejected with a localized error
    await page
      .getByRole("button", { name: /create group/i })
      .first()
      .click();
    await page.getByLabel("Group name").fill("Favorites");
    await page
      .getByRole("button", { name: /^create$/i })
      .last()
      .click();
    await expect(page.getByText(/already exists/i)).toBeVisible();

    // Delete (books untouched is covered in the detail tests)
    await page.getByRole("button", { name: /cancel/i }).click();
    await page.getByRole("button", { name: /delete group: reading pile/i }).click();
    await expect(page.getByText("Delete this group? Your books stay in the library.")).toBeVisible();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /delete group/i })
      .last()
      .click();
    await expect(page.getByText(/group deleted/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Reading Pile" })).toHaveCount(0);
  });

  test("group detail: empty state, add book from detail, grid, refresh", async ({ page }) => {
    await createGroup(page, "Favorites");
    await page.goto("/groups");
    await page.getByRole("link", { name: "Favorites" }).click();

    // Empty shelf state
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible();
    await expect(page.locator("header").getByText("0 books")).toBeVisible();
    await expect(page.getByText("Nothing on this shelf yet.")).toBeVisible();

    // Add a book, then add it to the group from the book detail page
    await page.getByRole("link", { name: /add books/i }).click();
    await expect(page).toHaveURL(/\/books/);
    await page.getByPlaceholder("Title").first().fill("Dune");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Dune", { exact: true }).first()).toBeVisible();
    await page.locator("a[href^='/books/']").first().click();
    await addCurrentBookToGroup(page, "Favorites");

    // Group detail shows the book using the standard grid
    await page.goto("/groups");
    await page.getByRole("link", { name: "Favorites" }).click();
    await expect(page.getByText("1 books")).toBeVisible();
    await expect(page.getByText("Dune", { exact: true }).first()).toBeVisible();
    await expect(page.locator("a[href^='/books/']").first()).toBeVisible();

    // Refresh keeps the group selected (URL route, no client-only state)
    await page.reload();
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible();
    await expect(page.getByText("Dune", { exact: true }).first()).toBeVisible();
  });

  test("books page group filter ANDs with tag filter", async ({ page }) => {
    await createGroup(page, "Favorites");
    await page.goto("/books");
    await page.getByPlaceholder("Title").first().fill("Grouped Sci-Fi");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Grouped Sci-Fi", { exact: true }).first()).toBeVisible();
    await page.getByPlaceholder("Title").first().fill("Poetry Book");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByText("Poetry Book", { exact: true }).first()).toBeVisible();

    // Tag one book and group it; tag the other but leave it ungrouped
    await page.goto("/books");
    await page.getByText("Grouped Sci-Fi", { exact: true }).first().click();
    await page.getByPlaceholder("e.g. fiction, history").fill("sci-fi");
    let savePost = page.waitForResponse((r) => r.request().method() === "POST");
    await page
      .getByRole("button", { name: /^save$/i })
      .first()
      .click();
    await savePost;
    await addCurrentBookToGroup(page, "Favorites");
    await page.goto("/books");
    await page.getByText("Poetry Book", { exact: true }).first().click();
    await page.getByPlaceholder("e.g. fiction, history").fill("poetry");
    savePost = page.waitForResponse((r) => r.request().method() === "POST");
    await page
      .getByRole("button", { name: /^save$/i })
      .first()
      .click();
    await savePost;

    // Group filter on the main books page: only the member book shows
    await page.goto("/books");
    await page.getByRole("button", { name: /filters/i }).click();
    await page.getByRole("combobox", { name: "Group" }).selectOption({ label: "Favorites" });
    await expect(page.getByText("Grouped Sci-Fi", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Poetry Book", { exact: true })).toBeHidden();

    // Group AND tag: member book is tagged sci-fi, filter demands poetry → empty
    await page.locator("select").filter({ hasText: "Tag" }).selectOption("poetry");
    await expect(page.getByText(/0 of/).first()).toBeVisible();

    // Matching tag → passes both conditions
    await page.locator("select").filter({ hasText: "Tag" }).selectOption("sci-fi");
    await expect(page.getByText("Grouped Sci-Fi", { exact: true }).first()).toBeVisible();
  });

  test("ownership: another user cannot access or see the group", async ({ page }) => {
    await createGroup(page, "Admin Private Shelf");
    const groupHref = await page.locator("a[href^='/groups/']").first().getAttribute("href");
    expect(groupHref).toMatch(/^\/groups\//);

    // User B registers (pending approval) and is approved by the admin
    await logout(page);
    await register(page, userB);
    await login(page, admin.email, admin.password);
    await page.goto("/admin/users");
    await page
      .getByRole("button", { name: /approve/i })
      .first()
      .click();

    await logout(page);
    await login(page, userB.email, userB.password);

    // User B's own groups page is empty — no data leaks from User A
    await page.goto("/groups");
    await expect(page.getByText("No groups yet")).toBeVisible();
    await expect(page.getByText("Admin Private Shelf")).toHaveCount(0);

    // Direct URL access to User A's group → 404
    await page.goto(groupHref ?? "/groups/unknown");
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
