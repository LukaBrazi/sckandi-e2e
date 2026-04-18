import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/login");
  }

  get emailInput() {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]');
  }

  get submitButton() {
    // scoped to form to avoid matching navbar "Увійти" buttons
    return this.page.locator("form").getByRole("button", { name: "Увійти" });
  }

  get forgotPasswordLink() {
    return this.page.getByRole("link", { name: /Забули пароль/i });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}