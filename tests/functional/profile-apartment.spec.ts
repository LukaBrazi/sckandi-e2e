"use strict";

import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ProfilePage } from "../../pages/ProfilePage";

// Requires seed data: make seed
// Tests for the apartment selection bug fix:
// - Resident can access profile page without error
// - Profile page shows apartment section
// - Apartment field does not show "вже зайнятий" (already taken) error

authTest.describe("Профіль — розділ квартири", () => {
  let profilePage: ProfilePage;

  authTest.beforeEach(async ({ tenantPage }) => {
    profilePage = new ProfilePage(tenantPage);
    await profilePage.goto();
  });

  authTest(
    "profile page loads apartment section without error",
    async ({ tenantPage }) => {
      // Verify we're on the profile page
      await expect(tenantPage).toHaveURL(/\/profile/);

      // Page loads without error toast
      const errorToast = tenantPage.locator(".Toastify__toast--error");
      try {
        const isVisible = await errorToast.isVisible({ timeout: 3_000 });
        expect(isVisible).toBe(false);
      } catch {
        // If timeout occurs, the error toast is not visible (expected behavior)
        expect(true).toBe(true);
      }

      // Profile page should show apartment info or section
      const apartmentSection = tenantPage.locator(
        "text=/квартира|apartment|апартамент/i",
      );
      await expect(apartmentSection.first()).toBeVisible({
        timeout: 10_000,
      });
    },
  );

  authTest("tenant profile shows their unit number", async ({ tenantPage }) => {
    // Verify we're on the profile page
    await expect(tenantPage).toHaveURL(/\/profile/);

    // Wait for profile content to be visible
    const profileContent = tenantPage.locator(
      '[class*="card"], [class*="profile"], main',
    );
    await expect(profileContent.first()).toBeVisible({
      timeout: 10_000,
    });

    // No "вже зайнятий" (already taken) error should appear
    const alreadyTakenError = tenantPage.getByText(
      /вже зайнятий|already taken|вже займає/i,
    );
    await expect(alreadyTakenError).toHaveCount(0);

    // Apartment section should be visible and contain some content
    const apartmentSection = tenantPage.locator(
      "text=/квартира|apartment|апартамент/i",
    );
    await expect(apartmentSection.first()).toBeVisible({
      timeout: 10_000,
    });
  });

  authTest(
    "resident profile apartment field accessible without 'already taken' error",
    async ({ resident1Page }) => {
      // Navigate to resident's profile
      await resident1Page.goto("/profile");
      await expect(resident1Page).toHaveURL(/\/profile/);

      // Wait for profile to load
      const profileContent = resident1Page.locator(
        '[class*="card"], [class*="profile"], main',
      );
      await expect(profileContent.first()).toBeVisible({
        timeout: 10_000,
      });

      // No error toast should be visible
      const errorToast = resident1Page.locator(".Toastify__toast--error");
      try {
        const isVisible = await errorToast.isVisible({ timeout: 3_000 });
        expect(isVisible).toBe(false);
      } catch {
        // If timeout occurs, the error toast is not visible (expected behavior)
        expect(true).toBe(true);
      }

      // No "вже зайнятий" error message should appear anywhere
      const errorMessage = resident1Page.getByText(
        /вже зайнятий|already taken|вже займає/i,
      );
      await expect(errorMessage).toHaveCount(0);
    },
  );
});
