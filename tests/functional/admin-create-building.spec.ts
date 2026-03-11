import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminBuildingsPage } from "../../pages/AdminBuildingsPage";

// Requires seed data: make seed

authTest.describe("Адмін створює будівлю → будівля відображається у списку", () => {
  const uid = Date.now();
  const newBuilding = {
    name: `ЖК Тест ${uid}`,
    address: "вул. Тестова, 99",
    city: "Харків",
  };

  authTest(
    "admin creates building → building appears in list",
    async ({ staffPage }) => {
      const buildingsPage = new AdminBuildingsPage(staffPage);
      await buildingsPage.goto();
      await expect(staffPage).toHaveURL(/\/admin\/buildings/);

      // Wait for table
      await staffPage.waitForTimeout(1_000);

      // Open create form
      await buildingsPage.addButton.click();
      await staffPage.waitForTimeout(500);

      // Fill form
      await buildingsPage.nameInput.fill(newBuilding.name);
      await buildingsPage.addressInput.fill(newBuilding.address);
      await buildingsPage.cityInput.fill(newBuilding.city);

      // Submit
      await buildingsPage.saveButton.click();

      // Expect success toast
      await expect(buildingsPage.successToast).toBeVisible({ timeout: 8_000 });

      // Verify building appears in the list
      const buildingEntry = buildingsPage.buildingInList(newBuilding.name);
      await expect(buildingEntry).toBeVisible({ timeout: 10_000 });
    },
  );
});