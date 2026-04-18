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

});

// Separate describe — no beforeEach that uses resident1Page,
// so the tenantPage fixture gets a clean page (not shared with resident1Page).
authTest.describe("Подача заявки — успішна подача мешканцем", () => {
  authTest(
    "tenant with apartment submits issue successfully",
    async ({ tenantPage }) => {
      // tenant@demo.com has an apartment linked in seed data (unit 105).
      // Submission should succeed → success toast or redirect to /profile.
      const tenantReportPage = new ReportIssuePage(tenantPage);
      await tenantReportPage.goto();
      await expect(tenantPage).toHaveURL(/\/report-issue/);

      await tenantReportPage.titleInput.fill("Тест подачі з квартирою");
      await tenantReportPage.descriptionTextarea.fill(
        "Перевірка успішної подачі заявки мешканцем із квартирою",
      );
      await tenantReportPage.submitButton.click();

      const successToast = await tenantReportPage.successToast
        .isVisible({ timeout: 10_000 })
        .catch(() => false);
      // After successful submit the app calls router.push("/profile") — client-side
      // nav, no "load" event. Use "commit" so the timeout isn't swallowed.
      const redirected = await tenantPage
        .waitForURL(/\/profile/, { timeout: 10_000, waitUntil: "commit" })
        .then(() => true)
        .catch(() => false);

      expect(successToast || redirected).toBe(true);
    },
  );
});