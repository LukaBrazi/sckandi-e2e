import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ReportIssuePage } from "../../pages/ReportIssuePage";
import { AdminIssuesPage } from "../../pages/AdminIssuesPage";

// Requires seed data: make seed
// resident1 has an apartment linked in seed data

authTest.describe("Мешканець створює заявку → відображається в адмін панелі", () => {
  authTest.setTimeout(60_000);
  const issueTitle = `E2E Тест заявки ${Date.now()}`;

  authTest(
    "tenant creates issue → issue appears in admin panel",
    async ({ browser }) => {
      // Step 1: Login as resident1 (has apartment) and create issue
      const tenantContext = await browser.newContext();
      const tenantPage = await tenantContext.newPage();

      const { LoginPage } = await import("../../pages/LoginPage");
      const { TEST_USERS } = await import("../../fixtures/test-data");

      const loginPage = new LoginPage(tenantPage);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.resident1.email, TEST_USERS.resident1.password);
      await tenantPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const reportPage = new ReportIssuePage(tenantPage);
      await reportPage.goto();
      await expect(tenantPage).toHaveURL(/\/report-issue/);

      // Fill issue title
      await reportPage.titleInput.fill(issueTitle);

      // Fill description textarea
      await reportPage.descriptionTextarea.fill("Опис тестової заявки для E2E тесту");

      // Submit the form
      await reportPage.submitButton.click();

      // Wait for success toast or redirect
      const successVisible = await loginPage.successToast
        .waitFor({ state: "visible", timeout: 10_000 })
        .then(() => true)
        .catch(() => false);
      const redirected = await tenantPage
        .waitForURL(/\/profile/, { timeout: 10_000 })
        .then(() => true)
        .catch(() => false);

      expect(successVisible || redirected).toBe(true);

      await tenantContext.close();

      // Step 2: Login as staff and verify issue appears in admin panel
      const staffContext = await browser.newContext();
      const staffPageObj = await staffContext.newPage();

      const staffLogin = new LoginPage(staffPageObj);
      await staffLogin.goto();
      await staffLogin.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
      await staffPageObj.waitForURL(/\/welcome/, { timeout: 15_000 });

      const adminIssues = new AdminIssuesPage(staffPageObj);
      await adminIssues.goto();
      await expect(staffPageObj).toHaveURL(/\/admin\/issues/);

      // Search for the created issue
      await adminIssues.searchFor(issueTitle);

      const issueRow = adminIssues.rowByTitle(issueTitle);
      await expect(issueRow).toBeVisible({ timeout: 10_000 });

      await staffContext.close();
    },
  );
});
