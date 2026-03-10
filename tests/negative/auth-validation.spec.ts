import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
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

test.describe("Register — negative / validation", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test("mismatched passwords — shows error", async ({ page }) => {
    await registerPage.fillForm({
      username: "testuser99",
      first_name: "Test",
      last_name: "User",
      email: `testuser99+${Date.now()}@test.com`,
      password: "Password123!",
      re_password: "DifferentPassword123!",
    });
    await registerPage.submit();
    const hasToastError = await registerPage.errorToast.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasFieldError = await page.locator("[class*='error'], [role='alert']").first().isVisible().catch(() => false);
    expect(hasToastError || hasFieldError).toBe(true);
  });

  test("empty form submission — shows error feedback", async ({ page }) => {
    await registerPage.submit();
    const hasToastError = await registerPage.errorToast.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasFieldError = await page.locator("[class*='error'], [role='alert']").first().isVisible().catch(() => false);
    expect(hasToastError || hasFieldError).toBe(true);
  });

  test("duplicate email — server returns error toast", async () => {
    // dispatcher@demo.com already exists from seed data
    await registerPage.fillForm({
      username: `newuser_${Date.now()}`,
      first_name: "New",
      last_name: "User",
      email: "dispatcher@demo.com",
      password: "Password123!",
      re_password: "Password123!",
    });
    await registerPage.submit();
    await expect(registerPage.errorToast).toBeVisible({ timeout: 8_000 });
  });
});
