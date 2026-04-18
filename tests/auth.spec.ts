import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Login page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("renders email input", async () => {
    await expect(loginPage.emailInput).toBeVisible();
  });

  test("renders password input", async () => {
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test("renders submit button", async () => {
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("has forgot password link", async () => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("shows error on invalid credentials", async () => {
    await loginPage.login("notexist@test.com", "wrongpassword123");
    await expect(loginPage.errorToast).toBeVisible({ timeout: 8_000 });
  });
});
