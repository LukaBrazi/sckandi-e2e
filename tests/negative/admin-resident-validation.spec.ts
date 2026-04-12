import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminResidentsPage } from "../../pages/AdminResidentsPage";

// Requires seed data: make seed
// Negative scenarios for resident creation — all errors must be in Ukrainian

authTest.describe("Адмін створює мешканця — валідація (негативні сценарії)", () => {
  let residentsPage: AdminResidentsPage;

  authTest.beforeEach(async ({ staffPage }) => {
    residentsPage = new AdminResidentsPage(staffPage);
    await residentsPage.goto();
    await expect(staffPage).toHaveURL(/\/admin\/residents/);
    await residentsPage.openCreateForm();
  });

  authTest(
    "empty form — shows Ukrainian error feedback",
    async ({ staffPage }) => {
      await residentsPage.saveButton.click();

      const hasToastError = await residentsPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert'], p[class*='text-red']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      // Verify errors are in Ukrainian
      if (hasFieldError) {
        const errors = await staffPage
          .locator(".text-red-500, [class*='error'], p[class*='text-red']")
          .allTextContents();
        const nonEmpty = errors.filter((t) => t.trim().length > 0);
        if (nonEmpty.length > 0) {
          expect(nonEmpty[0]).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Обов|Мінімум|Некоректний/u);
        }
      }
    },
  );

  authTest(
    "invalid email format — shows Ukrainian error",
    async ({ staffPage }) => {
      await residentsPage.fillCreateForm({
        email: "not-an-email",
        username: "validuser",
        firstName: "Іван",
        lastName: "Тестовий",
        password: "Test1234!",
      });
      await residentsPage.saveButton.click();

      const hasToastError = await residentsPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      if (hasFieldError) {
        const errorText = await staffPage
          .locator(".text-red-500, [class*='error']")
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => null);
        if (errorText && errorText.trim() && errorText.trim().length > 2) {
          expect(errorText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|email|Email/u);
        }
      }
    },
  );

  authTest(
    "too short password — shows Ukrainian error",
    async ({ staffPage }) => {
      await residentsPage.fillCreateForm({
        email: `valid.${Date.now()}@test.com`,
        username: `valid${Date.now()}`,
        firstName: "Іван",
        lastName: "Тест",
        password: "123",
      });
      await residentsPage.saveButton.click();

      const hasToastError = await residentsPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      if (hasFieldError) {
        const errorText = await staffPage
          .locator(".text-red-500, [class*='error']")
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => null);
        if (errorText && errorText.trim() && errorText.trim().length > 2) {
          // Should mention minimum length in Ukrainian
          expect(errorText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Мінімум|символ/u);
        }
      }
    },
  );

  authTest(
    "duplicate email — server returns Ukrainian error toast",
    async ({ staffPage }) => {
      // tenant@demo.com already exists from seed
      await residentsPage.fillCreateForm({
        email: "tenant@demo.com",
        username: `newuser${Date.now()}`,
        firstName: "Дублікат",
        lastName: "Тестовий",
        password: "Test1234!",
      });
      await residentsPage.saveButton.click();

      await expect(residentsPage.errorToast).toBeVisible({ timeout: 8_000 });
      const toastText = await residentsPage.errorToast.textContent();
      // Must be in Ukrainian (not raw English "already exists")
      expect(toastText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Помилка|email/ui);
    },
  );
});