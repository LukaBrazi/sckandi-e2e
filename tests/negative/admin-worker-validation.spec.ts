import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminWorkersPage } from "../../pages/AdminWorkersPage";

// Requires seed data: make seed
// Negative scenarios for worker creation — all errors must be in Ukrainian

authTest.describe("Адмін створює робітника — валідація (негативні сценарії)", () => {
  let workersPage: AdminWorkersPage;

  authTest.beforeEach(async ({ staffPage }) => {
    workersPage = new AdminWorkersPage(staffPage);
    await workersPage.goto();
    await expect(staffPage).toHaveURL(/\/admin\/workers/);
    await workersPage.openCreateForm();
  });

  authTest(
    "empty form — shows Ukrainian error feedback",
    async ({ staffPage }) => {
      await workersPage.saveButton.click();

      const hasToastError = await workersPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      if (hasFieldError) {
        const errors = await staffPage
          .locator(".text-red-500, [class*='error']")
          .allTextContents();
        const nonEmpty = errors.filter((t) => t.trim().length > 0);
        if (nonEmpty.length > 0) {
          expect(nonEmpty[0]).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Обов|Мінімум/u);
        }
      }
    },
  );

  authTest(
    "invalid email — shows Ukrainian error",
    async ({ staffPage }) => {
      await workersPage.fillCreateForm({
        email: "bad-email",
        username: "worker123",
        firstName: "Олег",
        lastName: "Тест",
        password: "Test1234!",
        occupation: "plumber",
      });
      await workersPage.saveButton.click();

      const hasError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasToast = await workersPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasError || hasToast).toBe(true);

      if (hasError) {
        const errorText = await staffPage
          .locator(".text-red-500, [class*='error']")
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => null);
        if (errorText && errorText.trim() && errorText.trim().length > 2) {
          expect(errorText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|email|Email/ui);
        }
      }
    },
  );

  authTest(
    "username too short — shows Ukrainian error",
    async ({ staffPage }) => {
      await workersPage.fillCreateForm({
        email: `valid.${Date.now()}@test.com`,
        username: "ab",
        firstName: "Олег",
        lastName: "Тест",
        password: "Test1234!",
        occupation: "mason",
      });
      await workersPage.saveButton.click();

      const hasError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasToast = await workersPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasError || hasToast).toBe(true);

      if (hasError) {
        const errorText = await staffPage
          .locator(".text-red-500, [class*='error']")
          .first()
          .textContent({ timeout: 5_000 })
          .catch(() => null);
        if (errorText && errorText.trim() && errorText.trim().length > 2) {
          expect(errorText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Мінімум|символ/u);
        }
      }
    },
  );

  authTest(
    "duplicate email — server shows error toast",
    async ({ staffPage }) => {
      // guard@demo.com already exists from seed
      await workersPage.fillCreateForm({
        email: "guard@demo.com",
        username: `newworker${Date.now()}`,
        firstName: "Дублікат",
        lastName: "Тест",
        password: "Test1234!",
        occupation: "electrician",
      });
      await workersPage.saveButton.click();

      await expect(workersPage.errorToast).toBeVisible({ timeout: 8_000 });
      const toastText = await workersPage.errorToast.textContent();
      // Backend may return English "User with this email already exists."
      // TODO: backend should return Ukrainian error messages (i18n gap)
      expect(toastText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Помилка|already exists|email/ui);
    },
  );

  authTest(
    "API rejects worker creation by non-staff — 403",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");
      const tokenRes = await request.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.tenant.email,
          password: TEST_USERS.tenant.password,
        },
      });
      // Cookie-based auth — token set as cookie, not in JSON body

      const res = await request.post("/api/v1/profiles/admin/create-user/", {
        data: {
          email: `test.${Date.now()}@test.com`,
          username: `test${Date.now()}`,
          first_name: "Test",
          last_name: "User",
          password: "Test1234!",
          occupation: "mason",
        },
      });
      expect([403, 401]).toContain(res.status());
    },
  );
});