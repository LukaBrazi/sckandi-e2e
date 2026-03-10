import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Skandi Apartments/);
  });

  test("displays hero heading", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Apartments");
  });

  test("CTA button is visible and navigates to register", async ({ page }) => {
    await page.goto("/");
    // The CTA is a Link > button, so click the link
    const cta = page.getByRole("link", { name: /Create Your Account/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/register/);
  });
});
