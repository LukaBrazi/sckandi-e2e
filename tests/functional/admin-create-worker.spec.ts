import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminWorkersPage } from "../../pages/AdminWorkersPage";

// Requires seed data: make seed

authTest.describe("Адмін створює робітника → робітник відображається у списку", () => {
  const uid = Date.now();
  const newWorker = {
    email: `e2e.worker.${uid}@test.com`,
    username: `e2ework${uid}`,
    firstName: "Василь",
    lastName: "Майстер",
    password: "Test1234!",
    occupation: "plumber",
  };

  authTest(
    "admin creates worker → worker appears in list",
    async ({ staffPage }) => {
      const workersPage = new AdminWorkersPage(staffPage);
      await workersPage.goto();
      await expect(staffPage).toHaveURL(/\/admin\/workers/);

      // Wait for table
      await workersPage.heading.waitFor({ state: "visible", timeout: 10_000 });

      // Open create form
      await workersPage.openCreateForm();

      // Fill form
      await workersPage.fillCreateForm(newWorker);

      // Submit
      await workersPage.saveButton.click();

      // Expect success toast
      await expect(workersPage.successToast).toBeVisible({ timeout: 8_000 });

      // Wait for table to refresh
      await staffPage.waitForTimeout(1_000);

      // Verify worker appears in list — use full name to avoid strict mode with seed data
      const workerEntry = workersPage.workerInList(
        `${newWorker.firstName} ${newWorker.lastName}`,
      );
      await expect(workerEntry).toBeVisible({ timeout: 10_000 });
    },
  );
});