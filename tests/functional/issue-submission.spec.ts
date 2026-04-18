import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";

// Requires seed data: make seed (or make e2e-full / make e2e-dev)
// Tests issue submission via /report-issue for tenant@demo.com.
// The tenant seeded by seed_demo has an apartment linked, so the form should submit successfully.

authTest.describe("Подача заявки через /report-issue", () => {
  authTest(
    "tenant sees report-issue form at /report-issue",
    async ({ tenantPage }) => {
      await tenantPage.goto("/report-issue");
      await expect(tenantPage).toHaveURL(/\/report-issue/, { timeout: 10_000 });

      // The form should be visible with a title input and description textarea
      await expect(
        tenantPage.locator('input[name="title"]'),
      ).toBeVisible({ timeout: 5_000 });
      await expect(
        tenantPage.locator('textarea[name="description"]'),
      ).toBeVisible({ timeout: 5_000 });
    },
  );

  authTest(
    "sidebar nav link 'Подати заявку' navigates to /report-issue",
    async ({ tenantPage }) => {
      await tenantPage.goto("/welcome");
      const navLink = tenantPage.getByRole("link", { name: /Подати заявку/i }).first();
      await navLink.waitFor({ state: "visible", timeout: 10_000 });
      await navLink.click();
      await expect(tenantPage).toHaveURL(/\/report-issue/, { timeout: 10_000 });
    },
  );

  authTest(
    "tenant fills and submits issue form — no apartment error, expects success",
    async ({ tenantPage }) => {
      // Regression: apartmentApiSlice was calling /apartments/my-apartments/ (404)
      // causing every tenant to see "Спочатку додайте квартиру" even with an apartment linked.
      // Fixed by changing to /apartments/my-apartment/ (singular).
      await tenantPage.goto("/report-issue");
      await expect(tenantPage).toHaveURL(/\/report-issue/, { timeout: 10_000 });

      // Fill the form
      await tenantPage.locator('input[name="title"]').fill("E2E тест заявка");
      await tenantPage
        .locator('textarea[name="description"]')
        .fill("Автоматичний тест — опис проблеми");

      // Submit
      await tenantPage
        .getByRole("button", { name: /Подати заявку/i })
        .click();

      // Must NOT show the "no apartment" error — that was the pre-fix regression symptom.
      await expect(
        tenantPage.getByText(/Спочатку додайте квартиру/i),
      ).not.toBeVisible({ timeout: 5_000 });

      // Success path: toast appears or user is redirected to /profile
      const successToast = await tenantPage
        .locator(".Toastify__toast--success")
        .isVisible({ timeout: 10_000 })
        .catch(() => false);

      const redirectedToProfile = await tenantPage
        .waitForURL(/\/profile/, { timeout: 10_000 })
        .then(() => true)
        .catch(() => false);

      expect(successToast || redirectedToProfile).toBe(true);
    },
  );
});
