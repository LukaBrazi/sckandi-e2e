import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AdminBuildingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/admin/buildings");
  }

  get heading() {
    return this.page.getByText(/Будинки|Будівлі/i).first();
  }

  get addButton() {
    return this.page.getByRole("button", { name: /Додати будинок/i });
  }

  get nameInput() {
    return this.page.locator('input[placeholder="Будинок №1"]');
  }

  get addressInput() {
    return this.page.locator('input[placeholder*="Шевченка"]');
  }

  get cityInput() {
    return this.page.locator('input[placeholder="Київ"]');
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /Створити будинок/i });
  }

  get tableRows() {
    return this.page.locator("table tbody tr");
  }

  buildingInList(name: string) {
    return this.page.getByText(name, { exact: false });
  }

  async createBuilding(name: string, address: string, city: string) {
    await this.addButton.click();
    await this.nameInput.fill(name);
    await this.addressInput.fill(address);
    await this.cityInput.fill(city);
    await this.saveButton.click();
  }
}