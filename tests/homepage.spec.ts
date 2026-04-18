import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Homepage", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/ApartmentOS/);
  });

  test("displays hero heading", async () => {
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText("ApartmentOS");
  });

  test("CTA link is visible", async () => {
    await expect(homePage.ctaLink).toBeVisible();
  });

  test("CTA navigates to login page", async ({ page }) => {
    await homePage.ctaLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("page returns HTTP 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
  });
});
