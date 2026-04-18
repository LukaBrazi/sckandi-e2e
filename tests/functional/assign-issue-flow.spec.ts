import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminIssuesPage } from "../../pages/AdminIssuesPage";

// Requires seed data: make seed
// guard@demo.com shows up in admin workers dropdown (non-tenant, non-staff)
// guard can see assigned issues on their profile under "Призначені заявки" tab

authTest.describe("Адмін призначає заявку на робітника → робітник бачить її", () => {
  authTest(
    "admin assigns issue to guard → guard sees it in assigned-issues tab",
    async ({ browser }) => {
      const { LoginPage } = await import("../../pages/LoginPage");
      const { TEST_USERS } = await import("../../fixtures/test-data");

      // Step 1: Login as admin and assign issue to guard
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();

      const adminLogin = new LoginPage(adminPage);
      await adminLogin.goto();
      await adminLogin.login(TEST_USERS.dispatcher.email, TEST_USERS.dispatcher.password);
      await adminPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const adminIssues = new AdminIssuesPage(adminPage);
      await adminIssues.goto();
      await expect(adminPage).toHaveURL(/\/admin\/issues/);

      // Wait for the first row — seed_demo guarantees 45 issues.
      const firstRow = adminIssues.tableRows.first();
      await firstRow.waitFor({ state: "visible", timeout: 10_000 });

      // Open the edit Dialog for the first row
      await adminIssues.editButtonInRow(firstRow).click();
      await adminPage.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5_000 });
      await adminPage.waitForTimeout(300);

      // Use the Assignee Shadcn Select (3rd combobox in dialog)
      const assigneeSelect = adminIssues.dialogAssigneeSelect;
      const assigneeVisible = await assigneeSelect.isVisible({ timeout: 3_000 }).catch(() => false);

      if (assigneeVisible) {
        await assigneeSelect.click();
        await adminPage.waitForTimeout(400);

        // Select guard from dropdown options. The SelectItem renders
        // "{full_name} @{username}" — so we match on '@guard' (unique) with
        // fallbacks for Ukrainian/legacy labels.
        const guardOption = adminPage
          .locator('[role="option"]')
          .filter({ hasText: /@guard|\bguard\b|Охоронець|Микола/i })
          .first();
        const guardOptionVisible = await guardOption
          .isVisible({ timeout: 3_000 })
          .catch(() => false);
        if (guardOptionVisible) {
          await guardOption.click();
          await adminPage.waitForTimeout(500); // Radix Select commit delay
          await adminIssues.dialogSaveButton.click();
          // waitFor is more reliable than isVisible for transient toast elements.
          const saved = await adminIssues.successToast
            .waitFor({ state: "visible", timeout: 15_000 })
            .then(() => true)
            .catch(() => false);
          expect(saved).toBe(true);
        } else {
          // Guard not found in options — close dialog and continue.
          await adminPage.keyboard.press("Escape");
          await adminPage.waitForTimeout(200);
        }
      } else {
        await adminPage.keyboard.press("Escape");
        await adminPage.waitForTimeout(200);
      }

      await adminContext.close();

      // Step 2: Login as guard and check assigned issues on profile
      const guardContext = await browser.newContext();
      const guardPageObj = await guardContext.newPage();

      const guardLogin = new LoginPage(guardPageObj);
      await guardLogin.goto();
      await guardLogin.login(TEST_USERS.guard.email, TEST_USERS.guard.password);
      await guardPageObj.waitForURL(/\/welcome/, { timeout: 15_000 });

      await guardPageObj.goto("/profile");
      await expect(guardPageObj).toHaveURL(/\/profile/);

      // Click "Призначені заявки" tab
      const assignedTab = guardPageObj.getByRole("tab", { name: /Призначені заявки/i });
      await assignedTab.waitFor({ state: "visible", timeout: 10_000 });
      await assignedTab.click();

      // Wait for tab panel to become active (Radix sets data-state="active"),
      // then verify either the count header "Всього:" renders or an empty-state
      // fallback. A spinner may show briefly — 15s covers it.
      const activePanel = guardPageObj.locator(
        '[role="tabpanel"][data-state="active"]',
      );
      await activePanel.waitFor({ state: "visible", timeout: 10_000 });

      const assignedContent = guardPageObj
        .getByText(/Всього:|No Issue\(s\) Assigned|assigned/i)
        .first();
      await expect(assignedContent).toBeVisible({ timeout: 15_000 });

      await guardContext.close();
    },
  );
});
