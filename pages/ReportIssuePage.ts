import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ReportIssuePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/report-issue");
  }

  get heading() {
    return this.page.getByText(/Подати заявку/i).first();
  }

  get titleInput() {
    return this.page.locator('input[name="title"]');
  }

  get descriptionTextarea() {
    return this.page.locator('textarea[name="description"]');
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Надіслати|Подати|Submit/i });
  }
}
