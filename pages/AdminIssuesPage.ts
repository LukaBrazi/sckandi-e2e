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

  /** Edit button (pencil icon) inside a row */
  editButtonInRow(row: ReturnType<Page["locator"]>) {
    return row.locator('button[title="Редагувати"]');
  }

  /** Status select inside Dialog (Shadcn) — first combobox in dialog */
  get dialogStatusSelect() {
    return this.page.locator('[role="dialog"] [role="combobox"]').nth(0);
  }

  /** Assignee select inside Dialog — third combobox in dialog */
  get dialogAssigneeSelect() {
    return this.page.locator('[role="dialog"] [role="combobox"]').nth(2);
  }

  /** Submit button inside the edit Dialog */
  get dialogSaveButton() {
    return this.page.locator('[role="dialog"]').getByRole("button", { name: /Зберегти/i });
  }

  /** Status select inside a row (legacy — kept for backward compat, rows use Dialog now) */
  statusSelectInRow(row: ReturnType<Page["locator"]>) {
    return row.locator("select").first();
  }

  /** Radix-ui Select trigger for "Виконавець" column (legacy) */
  assignedToTriggerInRow(row: ReturnType<Page["locator"]>) {
    return row.locator('[role="combobox"], button').filter({ hasText: /Не призначено|Призначено/i }).first();
  }

  async searchFor(text: string) {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(600);
  }

  /** Open the edit Dialog for the row with a given title, change status, and save */
  async changeStatusViaDialog(title: string, newStatus: string) {
    const row = this.rowByTitle(title);
    await this.editButtonInRow(row).click();
    await this.page.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5_000 });
    await this.dialogStatusSelect.click();
    await this.page.locator('[role="option"]').filter({ hasText: new RegExp(newStatus, "i") }).first().click();
    await this.dialogSaveButton.click();
    await this.waitForSuccessToast();
  }

  /** Open the edit Dialog for the first row, assign to a worker by name, and save */
  async assignWorkerViaDialog(workerName: string) {
    const firstRow = this.tableRows.first();
    await this.editButtonInRow(firstRow).click();
    await this.page.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5_000 });
    await this.dialogAssigneeSelect.click();
    await this.page.locator('[role="option"]').filter({ hasText: new RegExp(workerName, "i") }).first().click();
    await this.dialogSaveButton.click();
    await this.waitForSuccessToast();
  }

  async changeStatusInRow(title: string, newStatus: string) {
    await this.changeStatusViaDialog(title, newStatus);
  }
}
