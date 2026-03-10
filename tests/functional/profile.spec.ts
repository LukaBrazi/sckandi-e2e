import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ProfilePage } from "../../pages/ProfilePage";

// Requires seed data: make seed

authTest.describe("Profile page — authenticated user", () => {
  let profilePage: ProfilePage;

  authTest.beforeEach(async ({ staffPage }) => {
    profilePage = new ProfilePage(staffPage);
    await profilePage.goto();
  });

  authTest("stays on /profile (no redirect)", async ({ staffPage }) => {
    await expect(staffPage).toHaveURL(/\/profile/);
  });

  authTest("page content is visible", async ({ staffPage }) => {
    // At minimum the page renders something
    const body = staffPage.locator("main, body");
    await expect(body).toBeVisible();
  });
});
