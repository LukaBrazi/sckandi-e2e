import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/profile");
  }

  get avatar() {
    return this.page.locator("img[alt*='avatar'], img[alt*='profile'], [class*='avatar']").first();
  }

  get fullName() {
    return this.page.locator("[class*='h3'], h3, [class*='name']").first();
  }
}
