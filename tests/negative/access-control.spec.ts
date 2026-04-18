import { test, expect } from "@playwright/test";
import { authTest } from "../../fixtures/auth.fixture";
import { LoginPage } from "../../pages/LoginPage";
import { TEST_USERS } from "../../fixtures/test-data";

// These tests verify that role-based access works correctly.
// They require seed data: make seed

test.describe("Access control — unauthenticated", () => {
  test("cannot access /admin panel unauthenticated", async ({ page }) => {
    await page.goto("/admin");
    // The admin page is client-side rendered.
    // Unauthenticated users are redirected away from /admin (to /login or /welcome).
    await page.waitForURL(/\/login|\/welcome/, { timeout: 10_000 });
    const finalUrl = page.url();
    expect(finalUrl).not.toMatch(/\/admin/);
  });

  test("API returns 401 for protected issue endpoint", async ({ request }) => {
    const res = await request.get("/api/v1/issues/");
    expect(res.status()).toBe(401);
  });

  test("API returns 401 for profile endpoint", async ({ request }) => {
    const res = await request.get("/api/v1/profiles/user/my-profile/");
    expect(res.status()).toBe(401);
  });
});

// Note: authTest requires seed data. Skip gracefully if login fails.
authTest.describe("Access control — tenant cannot access staff pages", () => {
  authTest("tenant sees /tenants page but limited data", async ({ tenantPage: page }) => {
    await page.goto("/tenants");
    // Tenant is not staff → TenantsPageContent fetches profile, then
    // router.replace("/welcome"). This is client-side History API nav, so
    // no fresh "load" event fires — default waitForURL (waitUntil:"load")
    // would hang. Use "commit" which resolves on URL change.
    await page.waitForURL(/\/welcome/, { timeout: 20_000, waitUntil: "commit" });
    await expect(page).not.toHaveURL(/\/tenants/);
  });
});
