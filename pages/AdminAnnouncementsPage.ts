import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AdminAnnouncementsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/admin/posts");
  }

  get heading() {
    return this.page.getByText(/Новини/i).first();
  }

  get addButton() {
    return this.page.getByRole("button", { name: /Нова новина/i });
  }

  get titleInput() {
    return this.page.locator('input[placeholder="Заголовок оголошення"]');
  }

  get bodyTextarea() {
    return this.page.locator('textarea[placeholder="Текст оголошення..."]');
  }

  /** Shadcn Select trigger for building inside the Dialog */
  get buildingTrigger() {
    return this.page.locator('[role="combobox"]').first();
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /Створити/i });
  }

  announcementInList(title: string) {
    return this.page.getByText(title, { exact: false });
  }

  /** Select the first available building from the Shadcn Select dropdown */
  async selectFirstBuilding() {
    await this.buildingTrigger.click();
    await this.page.waitForTimeout(300);
    const firstOption = this.page.locator('[role="option"]').first();
    await firstOption.waitFor({ state: "visible", timeout: 5_000 });
    await firstOption.click();
  }

  async createAnnouncement(title: string, body: string) {
    await this.addButton.click();
    await this.page.waitForTimeout(500);
    await this.selectFirstBuilding();
    await this.titleInput.fill(title);
    await this.bodyTextarea.fill(body);
    await this.saveButton.click();
  }
}
