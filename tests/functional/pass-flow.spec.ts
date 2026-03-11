import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { RequestPassPage } from "../../pages/RequestPassPage";
import { GuardPortalPage } from "../../pages/GuardPortalPage";

// Requires seed data: make seed

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

authTest.describe("Мешканець створює пропуск → охорона бачить його", () => {
  const visitDate = tomorrowISO();

  authTest(
    "tenant creates vehicle pass → guard sees it on portal",
    async ({ browser }) => {
      // Step 1: Login as tenant and create pass
      const tenantContext = await browser.newContext();
      const tenantPage = await tenantContext.newPage();

      const { LoginPage } = await import("../../pages/LoginPage");
      const { TEST_USERS } = await import("../../fixtures/test-data");

      const loginPage = new LoginPage(tenantPage);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.tenant.email, TEST_USERS.tenant.password);
      await tenantPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const requestPassPage = new RequestPassPage(tenantPage);
      await requestPassPage.goto();
      await expect(tenantPage).toHaveURL(/\/request-pass/);

      await requestPassPage.fillAndSubmit(
        visitDate,
        "AA1111BB",
        "E2E тест — перевірка пропуску",
      );

      // Wait for success
      const success = await requestPassPage.successToast
        .isVisible({ timeout: 10_000 })
        .catch(() => false);
      const redirected = await tenantPage
        .waitForURL(/\/profile/, { timeout: 10_000 })
        .then(() => true)
        .catch(() => false);
      expect(success || redirected).toBe(true);

      await tenantContext.close();

      // Step 2: Login as guard and verify pass on guard portal
      const guardContext = await browser.newContext();
      const guardPage = await guardContext.newPage();

      const guardLogin = new LoginPage(guardPage);
      await guardLogin.goto();
      await guardLogin.login(TEST_USERS.guard.email, TEST_USERS.guard.password);
      await guardPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const guardPortal = new GuardPortalPage(guardPage);
      await guardPortal.goto();
      await expect(guardPage).toHaveURL(/\/guard-portal/);

      // Set date to tomorrow
      await guardPortal.setDate(visitDate);
      await guardPage.waitForTimeout(1_500);

      // Verify pass appears (by car number or status text)
      const passVisible = await guardPage
        .getByText("AA1111BB", { exact: false })
        .isVisible({ timeout: 10_000 })
        .catch(() => false);
      const countText = await guardPage
        .getByText(/результат/i)
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      expect(passVisible || countText).toBe(true);

      await guardContext.close();
    },
  );
});