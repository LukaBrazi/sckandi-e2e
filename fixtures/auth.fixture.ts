import { test as base, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USERS } from "./test-data";

type AuthFixtures = {
  staffPage: Page;
  tenantPage: Page;
  guardPage: Page;
  resident1Page: Page;
};

async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL(/\/welcome/, { timeout: 15_000 });
}

export const authTest = base.extend<AuthFixtures>({
  staffPage: async ({ page }, use) => {
    await loginAs(
      page,
      TEST_USERS.dispatcher.email,
      TEST_USERS.dispatcher.password,
    );
    await use(page);
  },

  tenantPage: async ({ page }, use) => {
    await loginAs(
      page,
      TEST_USERS.tenant.email,
      TEST_USERS.tenant.password,
    );
    await use(page);
  },

  guardPage: async ({ page }, use) => {
    await loginAs(
      page,
      TEST_USERS.guard.email,
      TEST_USERS.guard.password,
    );
    await use(page);
  },

  resident1Page: async ({ page }, use) => {
    await loginAs(
      page,
      TEST_USERS.resident1.email,
      TEST_USERS.resident1.password,
    );
    await use(page);
  },
});
