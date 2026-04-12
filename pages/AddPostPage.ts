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

  async fillAndSubmit(title: string, body: string, tag = "e2e-тест") {
    await this.titleInput.fill(title);
    await this.bodyTextarea.fill(body);
    // Tags input requires pressing Enter to add each tag
    await this.tagsInput.fill(tag);
    await this.tagsInput.press("Enter");
    await this.submitButton.click();
  }
}