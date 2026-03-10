import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string;
}

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/register");
  }

  get usernameInput() {
    return this.page.locator('input[name="username"]');
  }

  get firstNameInput() {
    return this.page.locator('input[name="first_name"]');
  }

  get lastNameInput() {
    return this.page.locator('input[name="last_name"]');
  }

  get emailInput() {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]');
  }

  get rePasswordInput() {
    return this.page.locator('input[name="re_password"]');
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Зареєструватися/i });
  }

  get loginLink() {
    return this.page.getByRole("link", { name: /Вхід|Увійти/i });
  }

  async fillForm(data: RegisterData) {
    await this.usernameInput.fill(data.username);
    await this.firstNameInput.fill(data.first_name);
    await this.lastNameInput.fill(data.last_name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.rePasswordInput.fill(data.re_password);
  }

  async submit() {
    await this.submitButton.click();
  }
}