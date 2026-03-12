/**
 * E2E tests for News feature (/news list and detail pages).
 */

import { test, expect } from "@playwright/test";
import { authTest } from "../../fixtures/auth.fixture";

// ── Navigation ────────────────────────────────────────────────────────────────

authTest.describe("News navigation", () => {
  authTest("nav link 'Новини' is present and points to /news", async ({ tenantPage }) => {
    await tenantPage.goto("/welcome");
    const navLink = tenantPage.getByRole("link", { name: /^Новини$/i });
    await expect(navLink).toBeVisible({ timeout: 10_000 });
    const href = await navLink.getAttribute("href");
    expect(href).toContain("/news");
  });

  authTest("nav does NOT contain 'Оголошення' link", async ({ tenantPage }) => {
    await tenantPage.goto("/welcome");
    const oldLink = tenantPage.getByRole("link", { name: /^Оголошення$/i });
    await expect(oldLink).not.toBeVisible();
  });
});

// ── /news list page ───────────────────────────────────────────────────────────

authTest.describe("News list page", () => {
  authTest("page loads without error", async ({ tenantPage }) => {
    await tenantPage.goto("/news");
    await expect(tenantPage.getByRole("heading", { name: /Новини/i })).toBeVisible({ timeout: 10_000 });
    await expect(tenantPage.getByText(/Unhandled Runtime Error/i)).not.toBeVisible();
  });

  authTest("no .map TypeError on news page", async ({ tenantPage }) => {
    const errors: string[] = [];
    tenantPage.on("pageerror", (err) => errors.push(err.message));
    await tenantPage.goto("/news");
    await tenantPage.waitForTimeout(3_000);
    const mapErrors = errors.filter((e) => e.includes(".map is not a function"));
    expect(mapErrors).toHaveLength(0);
  });
});

// ── Admin news CRUD ───────────────────────────────────────────────────────────

authTest.describe("Admin news CRUD", () => {
  authTest("admin can navigate to /admin/news", async ({ staffPage }) => {
    await staffPage.goto("/admin/news");
    await expect(staffPage.getByRole("heading", { name: /Новини порталу/i })).toBeVisible({ timeout: 10_000 });
  });

  authTest("admin can open create form", async ({ staffPage }) => {
    await staffPage.goto("/admin/news");
    const addButton = staffPage.getByRole("button", { name: /Нова новина/i });
    await expect(addButton).toBeVisible({ timeout: 8_000 });
    await addButton.click();
    await expect(staffPage.getByPlaceholder(/Заголовок/i)).toBeVisible({ timeout: 5_000 });
  });
});

// ── /news detail page ─────────────────────────────────────────────────────────

test.describe("News detail page", () => {
  test("navigating to invalid slug shows error state", async ({ page }) => {
    const { LoginPage } = await import("../../pages/LoginPage");
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("tenant@demo.com", "Demo1234!");
    await page.waitForURL(/\/welcome/, { timeout: 15_000 });

    await page.goto("/news/this-slug-does-not-exist-xyz");
    await expect(page.getByText(/не знайдено|not found|404/i)).toBeVisible({ timeout: 8_000 });
  });
});
