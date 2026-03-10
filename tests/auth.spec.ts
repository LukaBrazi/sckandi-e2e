import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

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

  test("has link to register page", async ({ page }) => {
    await expect(loginPage.registerLink).toBeVisible();
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("has forgot password link", async () => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("shows error on invalid credentials", async () => {
    await loginPage.login("notexist@test.com", "wrongpassword123");
    await expect(loginPage.errorToast).toBeVisible({ timeout: 8_000 });
  });
});

test.describe("Register page", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test("renders username field", async () => {
    await expect(registerPage.usernameInput).toBeVisible();
  });

  test("renders first name field", async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
  });

  test("renders last name field", async () => {
    await expect(registerPage.lastNameInput).toBeVisible();
  });

  test("renders email field", async () => {
    await expect(registerPage.emailInput).toBeVisible();
  });

  test("renders password field", async () => {
    await expect(registerPage.passwordInput).toBeVisible();
  });

  test("renders confirm password field", async () => {
    await expect(registerPage.rePasswordInput).toBeVisible();
  });

  test("has submit button", async () => {
    await expect(registerPage.submitButton).toBeVisible();
  });
});
