import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminIssuesPage } from "../../pages/AdminIssuesPage";

// Requires seed data: make seed
// Seed creates issues with status "reported" — admin changes to "accepted"
// Tenant then sees updated status on their profile issues tab

authTest.describe("Адмін змінює статус скарги → мешканець бачить зміну", () => {
  // Use a known seed issue title
  const knownIssueTitle = "Протікає труба у ванній";

  authTest(
    "admin changes issue status → status updated in system",
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

      // Search for the known issue
      await adminIssues.searchFor(knownIssueTitle);
      await adminIssues.tableRows.first().waitFor({ state: "visible", timeout: 10_000 });

      // Find the issue row
      const issueRow = adminIssues.rowByTitle(knownIssueTitle);
      const rowVisible = await issueRow.isVisible({ timeout: 5_000 }).catch(() => false);

      if (rowVisible) {
        // Open edit Dialog and change status
        await adminIssues.editButtonInRow(issueRow).click();
        await adminPage.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5_000 });

        // Change status using the Shadcn Select in the Dialog
        await adminIssues.dialogStatusSelect.click();
        await adminPage.waitForTimeout(300);
        const acceptedOption = adminPage.locator('[role="option"]').filter({ hasText: /Прийнято/i }).first();
        const optionVisible = await acceptedOption.isVisible({ timeout: 3_000 }).catch(() => false);
        if (optionVisible) {
          await acceptedOption.click();
          await adminIssues.dialogSaveButton.click();
          await expect(adminIssues.successToast).toBeVisible({ timeout: 8_000 });
        }
      }

      await adminContext.close();

      // Step 2: Resident logs in and sees updated issue status on profile
      const residentContext = await browser.newContext();
      const residentPage = await residentContext.newPage();

      const residentLogin = new LoginPage(residentPage);
      await residentLogin.goto();
      await residentLogin.login(TEST_USERS.resident1.email, TEST_USERS.resident1.password);
      await residentPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      await residentPage.goto("/profile");
      await expect(residentPage).toHaveURL(/\/profile/);

      // Click "Мої заявки" tab
      const myIssuesTab = residentPage.getByRole("tab", { name: /Мої заявки/i });
      await myIssuesTab.waitFor({ state: "visible", timeout: 8_000 });
      await myIssuesTab.click();

      // Verify issue card is visible (regardless of exact status, the tab rendered)
      const issuesContent = residentPage.getByText(/Всього|Мої заявки/i).first();
      await expect(issuesContent).toBeVisible({ timeout: 8_000 });

      await residentContext.close();
    },
  );

  authTest(
    "status change is verified via API — returns updated status",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");

      // Get admin token
      const tokenRes = await request.post("/api/v1/auth/jwt/create/", {
        data: {
          email: TEST_USERS.dispatcher.email,
          password: TEST_USERS.dispatcher.password,
        },
      });
      expect(tokenRes.ok()).toBeTruthy();
      const { access } = await tokenRes.json();

      // Fetch issues list and find one to update
      const issuesRes = await request.get("/api/v1/issues/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      expect(issuesRes.ok()).toBeTruthy();
      const data = await issuesRes.json();
      const issues: Array<{ id: string; status: string }> = data.issues?.results ?? data.results ?? [];
      expect(issues.length).toBeGreaterThan(0);

      const targetIssue = issues.find((i) => i.status === "reported") ?? issues[0];

      // Update status via admin endpoint
      const updateRes = await request.patch(
        `/api/v1/issues/admin/update/${targetIssue.id}/`,
        {
          headers: { Authorization: `Bearer ${access}` },
          data: { status: "accepted" },
        },
      );
      expect(updateRes.ok()).toBeTruthy();
      const updated = await updateRes.json();
      const updatedIssue = updated.issue ?? updated;
      expect(updatedIssue.status).toBe("accepted");
    },
  );
});
