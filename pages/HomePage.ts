import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/");
  }

  get heroTitle() {
    return this.page.locator("h1");
  }

  get heroSubtitle() {
    return this.page.locator("main p").first();
  }

  get ctaLink() {
    return this.page.getByRole("link", { name: /Створити акаунт/i });
  }

  get quickLinks() {
    return this.page.locator("main a").filter({ hasNotText: /Створити акаунт/i });
  }
}