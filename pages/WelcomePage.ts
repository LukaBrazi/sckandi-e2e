import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class WelcomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/welcome");
  }

  get postCards() {
    return this.page.locator("article, [class*='card'], [class*='post']");
  }
}
