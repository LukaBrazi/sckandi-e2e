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
    return this.page.getByText(/Новини та оголошення/i).first();
  }

  get addButton() {
    return this.page.getByRole("button", { name: /Нова новина/i });
  }

  get titleInput() {
    return this.page.locator('input[placeholder="Заголовок новини..."]');
  }

  get bodyTextarea() {
    return this.page.locator('textarea[placeholder="Текст новини..."]');
  }

  get buildingSelect() {
    return this.page.locator("select").first();
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /Створити/i });
  }

  announcementInList(title: string) {
    return this.page.getByText(title, { exact: false });
  }

  async createAnnouncement(title: string, body: string) {
    await this.addButton.click();
    await this.titleInput.fill(title);
    await this.bodyTextarea.fill(body);
    await this.saveButton.click();
  }
}