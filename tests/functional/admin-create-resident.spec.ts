import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminResidentsPage } from "../../pages/AdminResidentsPage";

// Requires seed data: make seed

authTest.describe("Адмін створює мешканця → мешканець відображається у списку", () => {
  const uid = Date.now();
  const newResident = {
    email: `e2e.resident.${uid}@test.com`,
    username: `e2eres${uid}`,
    firstName: "Тетяна",
    lastName: "Тестова",
    password: "Test1234!",
  };

  authTest(
    "admin creates resident → resident appears in list",
    async ({ staffPage }) => {
      const residentsPage = new AdminResidentsPage(staffPage);
      await residentsPage.goto();
      await expect(staffPage).toHaveURL(/\/admin\/residents/);

      // Count existing rows
      await residentsPage.tableRows.first().waitFor({ state: "visible", timeout: 10_000 });
      const initialCount = await residentsPage.tableRows.count();

      // Open create form
      await residentsPage.openCreateForm();

      // Fill form
      await residentsPage.fillCreateForm(newResident);

      // Submit
      await residentsPage.saveButton.click();

      // Expect success toast
      await expect(residentsPage.successToast).toBeVisible({ timeout: 8_000 });

      // Search in DataTable to handle pagination (pageSize=10)
      await residentsPage.searchInTable(`${newResident.firstName} ${newResident.lastName}`);

      // Wait for the new resident to appear in the filtered list
      const residentEntry = residentsPage.residentInList(
        `${newResident.firstName} ${newResident.lastName}`,
      );
      await expect(residentEntry).toBeVisible({ timeout: 10_000 });

      // Verify row count is not less than initial (pagination may cap display at 10)
      await staffPage.waitForTimeout(500);
      const newCount = await residentsPage.tableRows.count();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    },
  );
});