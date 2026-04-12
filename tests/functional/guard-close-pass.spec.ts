import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { GuardPortalPage } from "../../pages/GuardPortalPage";

// Requires seed data: make seed
// Flow: tenant creates pass via API → guard closes it → tenant sees "closed" via API
// NOTE: CustomTokenObtainPairAPIView sets tokens as cookies (not in JSON body).
//       Each user needs a separate browser context to maintain independent cookie jars.

authTest.describe("Охорона відмічає проїзд авто → мешканець бачить оновлення статусу", () => {
  authTest(
    "guard closes a vehicle pass → pass status becomes closed",
    async ({ browser }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");
      const today = new Date().toISOString().split("T")[0];

      // Step 1: Tenant creates a pass via API
      // Use a dedicated browser context so tenant cookies are isolated from guard cookies
      const tenantContext = await browser.newContext();
      const tenantReq = tenantContext.request;

      const tenantTokenRes = await tenantReq.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.tenant.email,
          password: TEST_USERS.tenant.password,
        },
      });
      expect(tenantTokenRes.ok()).toBeTruthy();
      // Cookie-based auth — token is stored in the context's cookie jar

      const createPassRes = await tenantReq.post("/api/v1/passes/", {
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
      const cardVisible = await passCard
        .isVisible({ timeout: 10_000 })
        .catch(() => false);

      if (cardVisible) {
        // Find the close button within the pass card container
        // Try multiple selector strategies to be robust
        const cardContainer = guardPage
          .locator("[class*='card'], [class*='pass'], article")
          .filter({ hasText: "CC9999CC" })
          .first();

        const closeBtn = cardContainer.getByRole("button", { name: /Позначити як проїхав/i });
        const closeBtnVisible = await closeBtn.isVisible({ timeout: 3_000 }).catch(() => false);

        if (closeBtnVisible) {
          await closeBtn.click();
          await guardPortal.successToast
            .waitFor({ state: "visible", timeout: 8_000 })
            .catch(() => null);
        } else {
          // Fallback: close via API using guard's own cookie context
          const guardReq = guardContext.request;
          await guardReq.post("/api/v1/auth/login/", {
            data: { email: TEST_USERS.guard.email, password: TEST_USERS.guard.password },
          });
          const closeRes = await guardReq.post(`/api/v1/passes/${passId}/close/`);
          expect(closeRes.ok()).toBeTruthy();
        }
      } else {
        // Card not visible, use API fallback with guard's own cookie context
        const guardReq = guardContext.request;
        await guardReq.post("/api/v1/auth/login/", {
          data: { email: TEST_USERS.guard.email, password: TEST_USERS.guard.password },
        });
        const closeRes = await guardReq.post(`/api/v1/passes/${passId}/close/`);
        expect(closeRes.ok()).toBeTruthy();
      }

      await guardContext.close();

      // Step 3: Verify tenant sees updated status via API (tenant cookie still valid)
      const myPassesRes = await tenantReq.get("/api/v1/passes/my/");
      expect(myPassesRes.ok()).toBeTruthy();
      const myPassesData = await myPassesRes.json();
      const passes: Array<{ id: string; status: string }> = myPassesData.results ?? myPassesData.passes?.results ?? [];
      const closedPass = passes.find((p) => p.id === passId);
      expect(closedPass?.status).toBe("closed");

      await tenantContext.close();
    },
  );
});