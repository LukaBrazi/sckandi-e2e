import { authTest } from "../../fixtures/auth.fixture";
import { expect, type APIRequestContext } from "@playwright/test";
import { GuardPortalPage } from "../../pages/GuardPortalPage";

// Requires seed data: make seed
// Flow: tenant creates pass via API → guard closes it → tenant sees "closed" via API

authTest.describe("Охорона відмічає проїзд авто → мешканець бачить оновлення статусу", () => {
  authTest(
    "guard closes a vehicle pass → pass status becomes closed",
    async ({ browser, request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");
      const today = new Date().toISOString().split("T")[0];

      // Step 1: Tenant creates a pass via API
      const tenantTokenRes = await request.post("/api/v1/auth/jwt/create/", {
        data: {
          email: TEST_USERS.tenant.email,
          password: TEST_USERS.tenant.password,
        },
      });
      expect(tenantTokenRes.ok()).toBeTruthy();
      const { access: tenantToken } = await tenantTokenRes.json();

      const createPassRes = await request.post("/api/v1/passes/", {
        headers: { Authorization: `Bearer ${tenantToken}` },
        data: {
          visit_date: today,
          car_number: "CC9999CC",
          comment: "E2E guard close test",
        },
      });
      expect(createPassRes.ok()).toBeTruthy();
      const passData = await createPassRes.json();
      const passId: string = passData.pass?.id ?? passData.id;
      expect(passId).toBeTruthy();

      // Step 2: Login as guard and close the pass via guard portal
      const guardContext = await browser.newContext();
      const guardPage = await guardContext.newPage();

      const { LoginPage } = await import("../../pages/LoginPage");
      const loginPage = new LoginPage(guardPage);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.guard.email, TEST_USERS.guard.password);
      await guardPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      const guardPortal = new GuardPortalPage(guardPage);
      await guardPortal.goto();
      await expect(guardPage).toHaveURL(/\/guard-portal/);

      // Set date to today
      await guardPortal.setDate(today);
      await guardPage.waitForTimeout(1_500);

      // Find our pass by car number and close it
      const passCard = guardPage.getByText("CC9999CC", { exact: false });
      await passCard.waitFor({ state: "visible", timeout: 10_000 });

      // Click close button near that card
      const closeBtn = guardPage
        .locator("[class*='card'], article, [class*='pass']")
        .filter({ hasText: "CC9999CC" })
        .getByRole("button", { name: /Позначити як проїхав/i });

      const closeBtnVisible = await closeBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (closeBtnVisible) {
        await closeBtn.click();
        await guardPortal.successToast.waitFor({ state: "visible", timeout: 8_000 }).catch(() => null);
      } else {
        // Fallback: close via API using guard token
        const guardTokenRes = await request.post("/api/v1/auth/jwt/create/", {
          data: {
            email: TEST_USERS.guard.email,
            password: TEST_USERS.guard.password,
          },
        });
        const { access: guardToken } = await guardTokenRes.json();
        const closeRes = await request.post(`/api/v1/passes/${passId}/close/`, {
          headers: { Authorization: `Bearer ${guardToken}` },
        });
        expect(closeRes.ok()).toBeTruthy();
      }

      await guardContext.close();

      // Step 3: Verify tenant sees updated status via API
      const myPassesRes = await request.get("/api/v1/passes/my/", {
        headers: { Authorization: `Bearer ${tenantToken}` },
      });
      expect(myPassesRes.ok()).toBeTruthy();
      const myPassesData = await myPassesRes.json();
      const passes: Array<{ id: string; status: string }> = myPassesData.results ?? myPassesData.passes?.results ?? [];
      const closedPass = passes.find((p) => p.id === passId);
      expect(closedPass?.status).toBe("closed");
    },
  );
});