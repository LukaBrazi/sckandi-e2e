import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AdminAnnouncementsPage } from "../../pages/AdminAnnouncementsPage";

// Requires seed data: make seed

authTest.describe("Адмін створює новину → відображається у списку", () => {
  const announcementTitle = `E2E Новина ${Date.now()}`;

  authTest(
    "staff creates announcement → it appears in admin posts list",
    async ({ staffPage }) => {
      const adminPosts = new AdminAnnouncementsPage(staffPage);
      await adminPosts.goto();
      await expect(staffPage).toHaveURL(/\/admin\/posts/);

      // Wait for page to load
      await adminPosts.heading.waitFor({ state: "visible", timeout: 10_000 });

      // Open create form
      await adminPosts.addButton.click();
      await staffPage.waitForTimeout(800);

      // Select the first available building from the Shadcn Select dropdown
      await adminPosts.selectFirstBuilding();

      // Fill announcement data
      await adminPosts.titleInput.fill(announcementTitle);
      await adminPosts.bodyTextarea.fill("Текст тестового оголошення для E2E перевірки.");

      // Submit — button says "Створити" for new items
      await adminPosts.saveButton.click();

      // Wait for success toast
      await expect(adminPosts.successToast).toBeVisible({ timeout: 8_000 });

      // Verify announcement appears in the list
      const announcementItem = adminPosts.announcementInList(announcementTitle);
      await expect(announcementItem).toBeVisible({ timeout: 10_000 });
    },
  );
});