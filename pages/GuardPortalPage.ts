import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class GuardPortalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/guard-portal");
  }

  get heading() {
    return this.page.getByText(/Портал охорони/i).first();
  }

  get dateInput() {
    return this.page.locator('input[type="date"]').first();
  }

  get passCards() {
    return this.page.locator("[class*='VehiclePassCard'], .vehicle-pass-card, [data-testid='pass-card']");
  }

  get closeButtons() {
    return this.page.getByRole("button", { name: /Позначити як проїхав/i });
  }

  get noPassesMessage() {
    return this.page.getByText(/Заявок на цю дату немає/i);
  }

  async setDate(date: string) {
    await this.dateInput.fill(date);
    // Trigger change event
    await this.dateInput.dispatchEvent("change");
  }

  async closeFirstPass() {
    await this.closeButtons.first().click();
  }
}