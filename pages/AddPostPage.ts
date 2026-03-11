import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AddPostPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/add-post");
  }

  get titleInput() {
    return this.page.locator('input[name="title"]');
  }

  get bodyTextarea() {
    return this.page.locator('textarea[name="body"]');
  }

  get tagsInput() {
    return this.page.locator('input[id="tags"]');
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Опублікувати/i });
  }

  async fillAndSubmit(title: string, body: string) {
    await this.titleInput.fill(title);
    await this.bodyTextarea.fill(body);
    await this.submitButton.click();
  }
}