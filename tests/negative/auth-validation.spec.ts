import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { INVALID_CREDENTIALS, INVALID_EMAIL_FORMAT } from "../../fixtures/test-data";

test.describe("Login — negative / validation", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("empty form — submit button is accessible but API rejects", async ({ page }) => {
    // The form uses noValidate, so the browser does not block submission.
    // Zod validates on mount (mode: 'all'), so submit with empty values triggers API error.
    await loginPage.submitButton.click();
    // Either a toast error or a field-level error message should appear
    const hasToastError = await loginPage.errorToast.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasFieldError = await page.locator("[class*='error'], [role='alert']").first().isVisible().catch(() => false);
    expect(hasToastError || hasFieldError).toBe(true);
  });

  test("invalid email format — shows error (toast or field validation)", async ({ page }) => {
    // The frontend may validate email format client-side (Zod) and show a
    // field-level error without making an API call, so no toast may appear.
    await loginPage.login(INVALID_EMAIL_FORMAT, "somepassword");
    const hasToastError = await loginPage.errorToast.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasFieldError = await page.locator("[class*='error'], [role='alert']").first().isVisible().catch(() => false);
    expect(hasToastError || hasFieldError).toBe(true);
  });

  test("correct email, wrong password — shows error toast", async () => {
    await loginPage.login(INVALID_CREDENTIALS.email, INVALID_CREDENTIALS.password);
    await expect(loginPage.errorToast).toBeVisible({ timeout: 8_000 });
  });

  test("error toast disappears after a while (auto-dismiss)", async () => {
    await loginPage.login(INVALID_CREDENTIALS.email, INVALID_CREDENTIALS.password);
    await expect(loginPage.errorToast).toBeVisible({ timeout: 8_000 });
    // react-toastify default auto-close is 5s
    await expect(loginPage.errorToast).not.toBeVisible({ timeout: 12_000 });
  });
});
