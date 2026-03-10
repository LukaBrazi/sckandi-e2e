import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ReportIssuePage } from "../../pages/ReportIssuePage";

// Requires seed data: make seed

authTest.describe("Report issue page — authenticated user", () => {
  let reportPage: ReportIssuePage;

  authTest.beforeEach(async ({ tenantPage }) => {
    reportPage = new ReportIssuePage(tenantPage);
    await reportPage.goto();
  });

  authTest("stays on /report-issue (no redirect)", async ({ tenantPage }) => {
    await expect(tenantPage).toHaveURL(/\/report-issue/);
  });

  authTest("shows page heading", async () => {
    await expect(reportPage.heading).toBeVisible({ timeout: 10_000 });
  });
});
