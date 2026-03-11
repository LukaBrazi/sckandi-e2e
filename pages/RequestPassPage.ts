import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RequestPassPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/request-pass");
  }

  get heading() {
    return this.page.getByText(/Замовити перепустку|пропуск/i).first();
  }

  get visitDateInput() {
    return this.page.locator('input[type="date"]');
  }

  get carNumberInput() {
    return this.page.locator('input[name="car_number"]');
  }

  get commentInput() {
    return this.page.locator('textarea[name="comment"]');
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Надіслати заявку/i });
  }

  async fillAndSubmit(visitDate: string, carNumber?: string, comment?: string) {
    await this.visitDateInput.fill(visitDate);
    if (carNumber) await this.carNumberInput.fill(carNumber);
    if (comment) await this.commentInput.fill(comment);
    await this.submitButton.click();
  }
}