import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AdminIssuesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/admin/issues");
  }

  get heading() {
    return this.page.getByText(/Заявки/i).first();
  }

  get searchInput() {
    return this.page.locator('input[placeholder*="Пошук заявок"]');
  }

  get tableRows() {
    return this.page.locator("table tbody tr");
  }

  /** Find a row containing the given text in the title column */
  rowByTitle(title: string) {
    return this.page.locator("table tbody tr").filter({ hasText: title });
  }

  /** Status select inside a row */
  statusSelectInRow(row: ReturnType<Page["locator"]>) {
    return row.locator("select").first();
  }

  /** Radix-ui Select trigger for "Виконавець" column */
  assignedToTriggerInRow(row: ReturnType<Page["locator"]>) {
    return row.locator('[role="combobox"], button').filter({ hasText: /Не призначено|Призначено/i }).first();
  }

  async searchFor(text: string) {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(600);
  }

  async changeStatusInRow(title: string, newStatus: string) {
    const row = this.rowByTitle(title);
    const select = this.statusSelectInRow(row);
    await select.selectOption(newStatus);
    await this.waitForSuccessToast();
  }
}