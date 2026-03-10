import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class TenantsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/tenants");
  }

  get heading() {
    return this.page.getByText(/Мешканці/i).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(/Пошук/i);
  }

  get table() {
    return this.page.locator("table");
  }

  get tableRows() {
    return this.page.locator("table tbody tr");
  }

  get tableHeaders() {
    return this.page.locator("table thead th");
  }

  get countBadge() {
    // Badge next to "Мешканці" heading showing total count
    return this.page.locator("h1 ~ *").first();
  }
}
