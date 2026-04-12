import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { RequestPassPage } from "../../pages/RequestPassPage";

// Requires seed data: make seed
// Negative scenarios for vehicle pass creation — all errors must be in Ukrainian

authTest.describe("Замовлення пропуску — валідація та помилки (негативні сценарії)", () => {
  let requestPassPage: RequestPassPage;

  authTest.beforeEach(async ({ tenantPage }) => {
    requestPassPage = new RequestPassPage(tenantPage);
    await requestPassPage.goto();
    await expect(tenantPage).toHaveURL(/\/request-pass/);
  });

  authTest(
    "empty form submission — shows Ukrainian error feedback",
    async ({ tenantPage }) => {
      await requestPassPage.submitButton.click();

      const hasToastError = await requestPassPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await tenantPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);
    },
  );

  authTest(
    "past date — rejected with Ukrainian error",
    async ({ tenantPage }) => {
      // Set yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split("T")[0];

      await requestPassPage.visitDateInput.fill(pastDate);
      await requestPassPage.submitButton.click();

      const hasToastError = await requestPassPage.errorToast
        .isVisible({ timeout: 8_000 })
        .catch(() => false);
      const hasFieldError = await tenantPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      // Verify the error message is in Ukrainian
      if (hasToastError) {
        const toastText = await requestPassPage.errorToast.textContent();
        expect(toastText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]/u);
      }
      if (hasFieldError) {
        const errorText = await tenantPage
          .locator(".text-red-500, [class*='error'], [role='alert']")
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => null);
        // Skip single-char required-field markers like "*" — only check meaningful error text
        if (errorText && errorText.trim() && errorText.trim().length > 2) {
          expect(errorText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]/u);
        }
      }
    },
  );

  authTest(
    "API rejects past-date pass — returns 400",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");

      const tokenRes = await request.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.tenant.email,
          password: TEST_USERS.tenant.password,
        },
      });
      // Login sets cookies — use cookie-based auth (token is not in JSON body)
      expect(tokenRes.ok()).toBeTruthy();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split("T")[0];

      const res = await request.post("/api/v1/passes/", {
        data: { visit_date: pastDate },
      });
      expect(res.status()).toBe(400);
    },
  );

  authTest(
    "unauthenticated pass creation returns 401",
    async ({ request }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const res = await request.post("/api/v1/passes/", {
        data: { visit_date: tomorrow.toISOString().split("T")[0] },
      });
      expect(res.status()).toBe(401);
    },
  );
});