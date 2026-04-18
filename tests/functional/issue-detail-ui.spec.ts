"use strict";

import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";

// Requires seed data: make seed
// Tests for issue detail page UI improvements:
// - Unassigned issues show "Не призначено" instead of "Not assigned Yet!"
// - Ukrainian status labels appear via StatusBadge (not raw English values)
// - Residents see status label but NOT priority label
// - Staff (dispatcher) DO see priority on issue detail

authTest.describe("Сторінка деталей заявки — UI", () => {
  authTest(
    "unassigned issue shows 'Не призначено' (not 'Not assigned Yet!')",
    async ({ resident1Page }) => {
      // Navigate to profile → my issues tab → click first issue
      await resident1Page.goto("/profile");
      await expect(resident1Page).toHaveURL(/\/profile/);

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      // Wait for the my-issues tab panel to be active
      const tabPanel = resident1Page.locator(
        '[role="tabpanel"][data-state="active"]',
      );
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      // Wait for issue link to be visible
      const issueLink = resident1Page.locator('[href^="/issue/"]').first();
      await issueLink.waitFor({ state: "visible", timeout: 15_000 });
      await issueLink.click();

      // Wait for navigation to issue detail page
      await resident1Page.waitForURL(/\/issue\//, { timeout: 10_000 });

      // "Не призначено" should appear
      await expect(
        resident1Page.getByText("Не призначено"),
      ).toBeVisible({ timeout: 8_000 });

      // Old English text must NOT appear
      const oldText = resident1Page.getByText("Not assigned Yet!", {
        exact: true,
      });
      await expect(oldText).toHaveCount(0);
    },
  );

  authTest(
    "issue detail shows Ukrainian status badge (not raw English)",
    async ({ resident1Page }) => {
      // Navigate to profile → my issues tab
      await resident1Page.goto("/profile");
      await expect(resident1Page).toHaveURL(/\/profile/);

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      // Wait for tab panel to be active
      const tabPanel = resident1Page.locator(
        '[role="tabpanel"][data-state="active"]',
      );
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      // Click first issue
      const issueLink = resident1Page.locator('[href^="/issue/"]').first();
      await issueLink.waitFor({ state: "visible", timeout: 15_000 });
      await issueLink.click();

      // Wait for navigation and page load
      await resident1Page.waitForURL(/\/issue\//, { timeout: 10_000 });
      await resident1Page
        .locator("text=Статус:")
        .waitFor({ state: "visible", timeout: 10_000 });

      // Ukrainian status badge should be visible
      const ukrainianStatus = resident1Page
        .locator("span")
        .filter({
          hasText: /^(Подано|Прийнято|В роботі|Виконано|Відхилено)$/,
        })
        .first();
      await expect(ukrainianStatus).toBeVisible({ timeout: 8_000 });

      // Raw English must NOT appear
      const rawEnglish = resident1Page.getByText(
        /^(reported|accepted|in_progress|done|rejected)$/,
        { exact: true },
      );
      await expect(rawEnglish).toHaveCount(0);
    },
  );

  authTest(
    "resident sees status label but NOT priority label on issue detail",
    async ({ resident1Page }) => {
      // Navigate to profile → my issues tab
      await resident1Page.goto("/profile");
      await expect(resident1Page).toHaveURL(/\/profile/);

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      // Wait for tab panel to be active
      const tabPanel = resident1Page.locator(
        '[role="tabpanel"][data-state="active"]',
      );
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      // Click first issue
      const issueLink = resident1Page.locator('[href^="/issue/"]').first();
      await issueLink.waitFor({ state: "visible", timeout: 15_000 });
      await issueLink.click();

      // Wait for navigation to issue detail page
      await resident1Page.waitForURL(/\/issue\//, { timeout: 10_000 });

      // Status label should be visible
      await expect(
        resident1Page.locator("text=Статус:"),
      ).toBeVisible({ timeout: 10_000 });

      // Priority label must NOT appear
      const priorityLabel = resident1Page.locator("text=Пріоритет:");
      await expect(priorityLabel).toHaveCount(0);
    },
  );

  authTest(
    "staff (dispatcher) DOES see priority on issue detail",
    async ({ staffPage }) => {
      // Navigate to admin issues page
      await staffPage.goto("/admin/issues");
      await expect(staffPage).toHaveURL(/\/admin\/issues/);

      // Wait for issues list to load
      await expect(staffPage.getByText(/Заявки/i).first()).toBeVisible({
        timeout: 10_000,
      });

      // Admin issues table uses router.push (not <a href>) — click table row directly
      const firstRow = staffPage.locator("table tbody tr").first();
      await firstRow.waitFor({ state: "visible", timeout: 15_000 });
      await firstRow.click();

      // Wait for navigation to issue detail page
      await staffPage.waitForURL(/\/issue\//, { timeout: 10_000 });

      // For staff, both status and priority should be visible
      await expect(
        staffPage.locator("text=Статус:"),
      ).toBeVisible({ timeout: 10_000 });

      // Priority label should be visible for staff
      const priorityLabel = staffPage.locator("text=Пріоритет:");
      await expect(priorityLabel).toBeVisible({ timeout: 8_000 });
    },
  );
});
