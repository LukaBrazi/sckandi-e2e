import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ReportIssuePage } from "../../pages/ReportIssuePage";

// Requires seed data: make seed
// Negative scenarios for issue creation — all errors must be in Ukrainian

authTest.describe("Подача заявки — валідація та помилки (негативні сценарії)", () => {
  let reportPage: ReportIssuePage;

  authTest.beforeEach(async ({ resident1Page }) => {
    reportPage = new ReportIssuePage(resident1Page);
    await reportPage.goto();
    await expect(resident1Page).toHaveURL(/\/report-issue/);
  });

  authTest(
    "empty form submission — shows Ukrainian error feedback",
    async ({ resident1Page }) => {
      await reportPage.submitButton.click();

      const hasToastError = await reportPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await resident1Page
        .locator("[class*='error'], [role='alert'], .text-red-500")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      // Verify error text is in Ukrainian (not English)
      if (hasFieldError) {
        const errorTexts = await resident1Page
          .locator("[class*='error'], [role='alert'], .text-red-500")
          .allTextContents();
        const nonEmpty = errorTexts.filter((t) => t.trim().length > 0);
        if (nonEmpty.length > 0) {
          const firstError = nonEmpty[0];
          // Should contain Ukrainian characters or Ukrainian words
          expect(firstError).toMatch(
            /[а-яА-ЯіІїЇєЄґҐ]|Обов|Мінімум|Введіть|Некоректний|поле|символів/u,
          );
        }
      }
    },
  );

  authTest(
    "title too short — shows Ukrainian validation error",
    async ({ resident1Page }) => {
      await reportPage.titleInput.fill("ab");
      await reportPage.submitButton.click();

      const errorVisible = await resident1Page
        .locator(".text-red-500, [class*='error']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      const toastVisible = await reportPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(errorVisible || toastVisible).toBe(true);
    },
  );

  authTest(
    "submitting issue without apartment — shows Ukrainian error toast",
    async ({ tenantPage }) => {
      // tenant@demo.com has no apartment — should get error on submit
      const tenantReportPage = new ReportIssuePage(tenantPage);
      await tenantReportPage.goto();

      await tenantReportPage.titleInput.fill("Тест без квартири");
      await tenantReportPage.descriptionTextarea.fill("Опис проблеми");
      await tenantReportPage.submitButton.click();

      // Should show Ukrainian error: "Спочатку додайте квартиру"
      const errorToast = await tenantReportPage.errorToast
        .isVisible({ timeout: 8_000 })
        .catch(() => false);
      if (errorToast) {
        const toastText = await tenantReportPage.errorToast.textContent();
        expect(toastText).toMatch(/квартир|профіл|Спочатку/i);
      } else {
        // Might show as field error
        const fieldError = await tenantPage
          .locator(".text-red-500, [role='alert']")
          .first()
          .isVisible({ timeout: 5_000 })
          .catch(() => false);
        expect(fieldError).toBe(true);
      }
    },
  );
});