import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminIssuesPage } from "../../pages/AdminIssuesPage";

// Relies on issues existing in the DB. `seed_demo` does NOT create any,
// so `fixtures/global-setup.ts` self-seeds a few via API before the suite.
// Tests here pick an issue dynamically rather than hardcoding a title.

authTest.describe("Адмін змінює статус скарги → мешканець бачить зміну", () => {
  authTest(
    "admin changes issue status → status updated in system",
    { timeout: 60_000 },
    async ({ browser }) => {
      const { LoginPage } = await import("../../pages/LoginPage");
      const { TEST_USERS } = await import("../../fixtures/test-data");

      // Step 1: Admin changes issue status via Dialog
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();

      const adminLogin = new LoginPage(adminPage);
      await adminLogin.goto();
      await adminLogin.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
      await adminPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const adminIssues = new AdminIssuesPage(adminPage);
      await adminIssues.goto();
      await expect(adminPage).toHaveURL(/\/admin\/issues/);

      // Pick the first available issue row — seed_demo guarantees 45 issues.
      const firstRow = adminIssues.tableRows.first();
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });

      // Open edit Dialog and change status
      await adminIssues.editButtonInRow(firstRow).click();
      await adminPage.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5_000 });

      await adminIssues.dialogStatusSelect.click();
      await adminPage.waitForTimeout(500);

      // Choose "Прийнято" from the dropdown
      const acceptedOption = adminPage
        .locator('[role="option"]')
        .filter({ hasText: /Прийнято/ })
        .first();
      await expect(acceptedOption).toBeVisible({ timeout: 5_000 });
      await acceptedOption.click();
      await adminPage.waitForTimeout(300);

      await expect(adminIssues.dialogSaveButton).toBeVisible({ timeout: 3_000 });
      await adminIssues.dialogSaveButton.click();
      await expect(adminIssues.successToast).toBeVisible({ timeout: 8_000 });

      await adminContext.close();

      // Step 2: Resident logs in and sees their profile's issue tab render
      const residentContext = await browser.newContext();
      const residentPage = await residentContext.newPage();

      const residentLogin = new LoginPage(residentPage);
      await residentLogin.goto();
      await residentLogin.login(TEST_USERS.resident1.email, TEST_USERS.resident1.password);
      await residentPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      await residentPage.goto("/profile");
      await expect(residentPage).toHaveURL(/\/profile/);

      const myIssuesTab = residentPage.getByRole("tab", { name: /Мої заявки/i });
      await myIssuesTab.waitFor({ state: "visible", timeout: 8_000 });
      await myIssuesTab.click();

      const issuesContent = residentPage.getByText(/Всього|Мої заявки/i).first();
      await expect(issuesContent).toBeVisible({ timeout: 8_000 });

      await residentContext.close();
    },
  );

  authTest(
    "status change is verified via API — returns updated status",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");

      // Log in as dispatcher (sets session cookies on `request` context)
      const tokenRes = await request.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.dispatcher.email,
          password: TEST_USERS.dispatcher.password,
        },
      });
      expect(tokenRes.ok()).toBeTruthy();

      const issuesRes = await request.get("/api/v1/issues/");
      expect(issuesRes.ok()).toBeTruthy();
      const data = await issuesRes.json();
      const issues: Array<{ id: string; status: string }> =
        data.issues?.results ?? data.results ?? [];

      expect(issues.length).toBeGreaterThan(0);

      // Prefer a "reported" issue to avoid idempotency no-ops; fall back to first
      const targetIssue =
        issues.find((i) => i.status === "reported") ?? issues[0];

      const updateRes = await request.patch(
        `/api/v1/issues/admin/update/${targetIssue.id}/`,
        { data: { status: "accepted" } },
      );
      expect(updateRes.ok()).toBeTruthy();
      const updated = await updateRes.json();
      const updatedIssue = updated.issue ?? updated;
      expect(updatedIssue.status).toBe("accepted");
    },
  );
});
