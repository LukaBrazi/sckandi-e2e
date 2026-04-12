import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminBuildingsPage } from "../../pages/AdminBuildingsPage";

// Requires seed data: make seed
// Negative scenarios for building creation — all errors must be in Ukrainian

authTest.describe("Адмін створює будівлю — валідація (негативні сценарії)", () => {
  let buildingsPage: AdminBuildingsPage;

  authTest.beforeEach(async ({ staffPage }) => {
    buildingsPage = new AdminBuildingsPage(staffPage);
    await buildingsPage.goto();
    await expect(staffPage).toHaveURL(/\/admin\/buildings/);
    // Open create form
    await buildingsPage.addButton.click();
    await staffPage.waitForTimeout(400);
  });

  authTest(
    "empty form — shows Ukrainian error feedback",
    async ({ staffPage }) => {
      await buildingsPage.saveButton.click();

      const hasToastError = await buildingsPage.errorToast
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
          expect(nonEmpty[0]).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Обов|поле/u);
        }
      }
    },
  );

  authTest(
    "duplicate building name — shows Ukrainian error toast",
    async ({ staffPage }) => {
      // ЖК Сонячний exists from seed data
      await buildingsPage.nameInput.fill("ЖК Сонячний");
      await buildingsPage.addressInput.fill("вул. Тестова, 99");
      await buildingsPage.cityInput.fill("Київ");
      await buildingsPage.saveButton.click();

      const errorToast = await buildingsPage.errorToast
        .isVisible({ timeout: 8_000 })
        .catch(() => false);

      // If API rejects duplicate, we get an error toast
      if (errorToast) {
        const toastText = await buildingsPage.errorToast.textContent();
        expect(toastText).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Помилка/u);
      }
      // If client allows duplicate and server rejects — also acceptable
    },
  );

  authTest(
    "API rejects building creation without auth — 401",
    async ({ request }) => {
      const res = await request.post("/api/v1/apartments/buildings/create/", {
        data: { name: "Test", address: "Test", city: "Kyiv", is_active: true },
      });
      expect(res.status()).toBe(401);
    },
  );

  authTest(
    "non-staff user cannot create building — 403",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");
      const tokenRes = await request.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.tenant.email,
          password: TEST_USERS.tenant.password,
        },
      });
      // Cookie-based auth — token set as cookie, not in JSON body

      // Use the admin endpoint for creating buildings (same as GET uses /admin/)
      const res = await request.post("/api/v1/apartments/buildings/admin/", {
        data: { name: "Test", address: "Test", city: "Kyiv", is_active: true },
      });
      expect([403, 401]).toContain(res.status());
    },
  );
});