import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  { path: "/tenants", name: "tenants" },
  { path: "/profile", name: "profile" },
  { path: "/add-rating", name: "add-rating" },
];

// REMOVED: self-registration disabled by design — /register removed from public routes
const PUBLIC_ROUTES = ["/", "/login", "/forgot-password"];

test.describe("Protected routes redirect unauthenticated users", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route.path} redirects to /login`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
    });
  }
});

test.describe("Public routes are accessible without auth", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} returns 2xx`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
    });
  }
});
