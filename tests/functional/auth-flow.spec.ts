import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { TEST_USERS } from "../../fixtures/test-data";

// Requires seed data: make seed

test.describe("Authentication flow — dispatcher (staff)", () => {
  test("successful login redirects to /welcome", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      TEST_USERS.dispatcher.email,
      TEST_USERS.dispatcher.password,
    );
    await expect(page).toHaveURL(/\/welcome/, { timeout: 15_000 });
  });

  test("successful login shows success toast", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      TEST_USERS.dispatcher.email,
      TEST_USERS.dispatcher.password,
    );
    await expect(loginPage.successToast).toBeVisible({ timeout: 8_000 });
  });
});

test.describe("Authentication flow — tenant", () => {
  test("tenant login redirects to /welcome", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      TEST_USERS.tenant.email,
      TEST_USERS.tenant.password,
    );
    await expect(page).toHaveURL(/\/welcome/, { timeout: 15_000 });
  });
});
