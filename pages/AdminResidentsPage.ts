import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AdminResidentsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/admin/residents");
  }

  get heading() {
    return this.page.getByText(/Мешканці/i).first();
  }

  get addButton() {
    return this.page.getByRole("button", { name: /Додати мешканця/i }).first();
  }

  get emailInput() {
    return this.page.locator('input[placeholder="email@example.com"]');
  }

  get usernameInput() {
    return this.page.locator('input[placeholder="username"]');
  }

  get firstNameInput() {
    return this.page.locator('input[placeholder="Іван"]');
  }

  get lastNameInput() {
    return this.page.locator('input[placeholder="Петренко"]');
  }

  get passwordInput() {
    return this.page.locator('input[placeholder="Мінімум 6 символів"]');
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /Створити мешканця/i });
  }

  get tableRows() {
    return this.page.locator("table tbody tr");
  }

  residentInList(name: string) {
    return this.page.locator("table tbody tr").filter({ hasText: name }).first();
  }

  get tableSearchInput() {
    return this.page.locator('input[placeholder*="Пошук мешканців"]');
  }

  async searchInTable(text: string) {
    await this.tableSearchInput.fill(text);
    await this.page.waitForTimeout(400);
  }

  async openCreateForm() {
    await this.addButton.click();
    await this.page.waitForTimeout(300);
  }

  async fillCreateForm(data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    await this.emailInput.fill(data.email);
    await this.usernameInput.fill(data.username);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.passwordInput.fill(data.password);
  }
}