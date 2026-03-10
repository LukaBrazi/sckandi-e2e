import { test, expect } from "@playwright/test";

// All tests run without auth cookies — ProtectedRoute checks
// document.cookie "logged_in=true" and redirects to /login if absent.

test.describe("Protected routes redirect unauthenticated users", () => {
  test("/welcome redirects to /login", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test("/tenants redirects to /login", async ({ page }) => {
    await page.goto("/tenants");
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test("/profile redirects to /login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});

test.describe("Public routes are accessible without auth", () => {
  test("/ is accessible", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
  });

  test("/login is accessible", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBeLessThan(400);
  });

  test("/register is accessible", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response?.status()).toBeLessThan(400);
  });
});
