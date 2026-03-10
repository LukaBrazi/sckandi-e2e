import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders email and password inputs", async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("has a submit button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Увійти/i }),
    ).toBeVisible();
  });

  test("shows error toast on invalid credentials", async ({ page }) => {
    await page.fill('input[name="email"]', "notexist@test.com");
    await page.fill('input[name="password"]', "wrongpassword123");
    await page.getByRole("button", { name: /Увійти/i }).click();

    // react-toastify error toast
    await expect(page.locator(".Toastify__toast--error")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("has a link to the register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /Зареєструватися/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("renders all required fields", async ({ page }) => {
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="re_password"]')).toBeVisible();
  });

  test("has a submit button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Зареєструватися/i }),
    ).toBeVisible();
  });
});
