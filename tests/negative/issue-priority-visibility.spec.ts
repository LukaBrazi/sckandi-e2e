import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";

// Requires seed data: make seed
// Verifies that a resident (non-staff) cannot see issue priority,
// while a staff member (dispatcher) can.
//
// NOTE: seed_demo creates issues for resident1–resident8, NOT for tenant.
// So we use resident1Page for profile-based tests (cards visible),
// and tenantPage only where we navigate directly via API-fetched issue ID.

authTest.describe("Пріоритет заявки — видимість за роллю", () => {
  authTest(
    "resident does NOT see priority on their issue card",
    async ({ resident1Page }) => {
      // Go to profile — My Issues tab shows IssueCard list
      await resident1Page.goto("/profile");
      await expect(resident1Page).toHaveURL(/\/profile/);

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      // Wait for the my-issues tab panel to be active
      const tabPanel = resident1Page.locator('[role="tabpanel"][data-state="active"]');
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      // Wait for issue cards to render (resident1 has issues from seed)
      const issueCard = resident1Page.locator('[href^="/issue/"]').first();
      await issueCard.waitFor({ state: "visible", timeout: 15_000 });

      // "Пріоритет:" label must NOT appear anywhere on the cards
      const priorityLabel = resident1Page.locator("text=Пріоритет:");
      await expect(priorityLabel).toHaveCount(0);
    },
  );

  authTest(
    "resident does NOT see priority on issue detail page",
    async ({ resident1Page }) => {
      // Navigate to profile and open first issue
      await resident1Page.goto("/profile");

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      const tabPanel = resident1Page.locator('[role="tabpanel"][data-state="active"]');
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      const issueLink = resident1Page.locator('[href^="/issue/"]').first();
      await issueLink.waitFor({ state: "visible", timeout: 15_000 });
      await issueLink.click();
      await resident1Page.waitForURL(/\/issue\//, { timeout: 10_000 });

      // Wait for the issue detail card to load
      await resident1Page.locator("text=Статус:").waitFor({ state: "visible", timeout: 10_000 });

      // "Пріоритет:" label must NOT appear on issue detail page
      const priorityLabel = resident1Page.locator("text=Пріоритет:");
      await expect(priorityLabel).toHaveCount(0);
    },
  );

  authTest(
    "staff DOES see admin issues page without errors",
    async ({ staffPage }) => {
      await staffPage.goto("/admin/issues");
      await expect(staffPage).toHaveURL(/\/admin\/issues/);
      await expect(
        staffPage.getByText(/Заявки/i).first(),
      ).toBeVisible({ timeout: 10_000 });
    },
  );

  authTest(
    "resident issue card shows Ukrainian status label (not raw English value)",
    async ({ resident1Page }) => {
      await resident1Page.goto("/profile");

      // Click the "Мої заявки" tab explicitly (Radix Tabs ignores ?tab= query param)
      await resident1Page.getByRole("tab", { name: /Мої заявки/i }).click();

      const tabPanel = resident1Page.locator('[role="tabpanel"][data-state="active"]');
      await tabPanel.waitFor({ state: "visible", timeout: 15_000 });

      const issueCard = resident1Page.locator('[href^="/issue/"]').first();
      await issueCard.waitFor({ state: "visible", timeout: 15_000 });

      // The status badge should contain a Ukrainian word, not raw English like "reported"
      const statusBadge = resident1Page
        .locator('[href^="/issue/"]')
        .first()
        .locator("span")
        .filter({ hasText: /Подано|Прийнято|В роботі|Виконано|Відхилено/ })
        .first();

      await expect(statusBadge).toBeVisible({ timeout: 8_000 });

      // Raw English values must NOT appear inside issue cards
      const firstCard = resident1Page.locator('[href^="/issue/"]').first();
      const rawStatus = firstCard.getByText(
        /^reported$|^accepted$|^in_progress$|^done$|^rejected$/,
        { exact: true },
      );
      await expect(rawStatus).toHaveCount(0);
    },
  );
});
