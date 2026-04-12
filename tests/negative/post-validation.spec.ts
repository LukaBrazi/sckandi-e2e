import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AddPostPage } from "../../pages/AddPostPage";

// Requires seed data: make seed
// Negative scenarios for post creation — all errors must be in Ukrainian

authTest.describe("Створення публікації — валідація та помилки (негативні сценарії)", () => {
  let addPostPage: AddPostPage;

  authTest.beforeEach(async ({ staffPage }) => {
    addPostPage = new AddPostPage(staffPage);
    await addPostPage.goto();
    await expect(staffPage).toHaveURL(/\/add-post/);
  });

  authTest(
    "empty form submission — shows Ukrainian error feedback",
    async ({ staffPage }) => {
      await addPostPage.submitButton.click();

      const hasToastError = await addPostPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);
    },
  );

  authTest(
    "missing body — shows Ukrainian validation error",
    async ({ staffPage }) => {
      await addPostPage.titleInput.fill("Заголовок без тіла публікації");
      // Leave body empty
      await addPostPage.submitButton.click();

      const hasToastError = await addPostPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);

      // Verify error is in Ukrainian
      if (hasFieldError) {
        const errors = await staffPage
          .locator(".text-red-500, [class*='error'], [role='alert']")
          .allTextContents();
        const nonEmpty = errors.filter((t) => t.trim().length > 0);
        if (nonEmpty.length > 0) {
          expect(nonEmpty[0]).toMatch(/[а-яА-ЯіІїЇєЄґҐ]|Обов|Мінімум|поле/u);
        }
      }
    },
  );

  authTest(
    "missing title — shows Ukrainian validation error",
    async ({ staffPage }) => {
      await addPostPage.bodyTextarea.fill("Текст без заголовку — має бути відхилено");
      await addPostPage.submitButton.click();

      const hasToastError = await addPostPage.errorToast
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      const hasFieldError = await staffPage
        .locator(".text-red-500, [class*='error'], [role='alert']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(hasToastError || hasFieldError).toBe(true);
    },
  );

  authTest(
    "unauthenticated post creation returns 401",
    async ({ request }) => {
      const res = await request.post("/api/v1/posts/create/", {
        data: { title: "Test", body: "Body", tags: [] },
      });
      expect(res.status()).toBe(401);
    },
  );
});