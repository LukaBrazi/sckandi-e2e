import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { TenantsPage } from "../../pages/TenantsPage";

// Requires seed data: make seed

authTest.describe("Tenants page — staff (dispatcher)", () => {
  let tenantsPage: TenantsPage;

  authTest.beforeEach(async ({ staffPage }) => {
    tenantsPage = new TenantsPage(staffPage);
    await tenantsPage.goto();
    // Wait for staff-only content to fully render (profile fetch + TenantCard mount)
    await tenantsPage.heading.waitFor({ state: "visible", timeout: 15_000 });
  });

  authTest("page loads at /tenants", async ({ staffPage }) => {
    await expect(staffPage).toHaveURL(/\/tenants/);
  });

  authTest("heading is visible", async () => {
    await expect(tenantsPage.heading).toBeVisible();
  });

  authTest("table is rendered", async () => {
    await expect(tenantsPage.table).toBeVisible();
  });

  authTest("table has data rows from seed", async () => {
    // Wait for API data to load before counting
    await tenantsPage.tableRows.first().waitFor({ state: "visible", timeout: 10_000 });
    const count = await tenantsPage.tableRows.count();
    authTest.expect(count).toBeGreaterThan(0);
  });

  authTest("search input is visible", async () => {
    await expect(tenantsPage.searchInput).toBeVisible();
  });

  authTest("search filters results", async ({ staffPage }) => {
    await tenantsPage.searchInput.fill("dispatcher");
    // Wait for API response (debounce + network)
    await staffPage.waitForTimeout(1_500);
    const rows = await tenantsPage.tableRows.count();
    authTest.expect(rows).toBeGreaterThanOrEqual(1);
  });

  authTest("search with no match shows empty state", async ({ staffPage }) => {
    await tenantsPage.searchInput.fill("zzz_no_match_xyz_99999");
    // Wait for API response (debounce + network)
    await staffPage.waitForTimeout(1_500);
    const emptyText = staffPage.getByText(/не знайдено|no results/i);
    await expect(emptyText).toBeVisible({ timeout: 8_000 });
  });
});
