import { type Page, type Locator } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  get successToast(): Locator {
    return this.page.locator(".Toastify__toast--success");
  }

  get errorToast(): Locator {
    return this.page.locator(".Toastify__toast--error");
  }

  async waitForSuccessToast() {
    await this.successToast.waitFor({ state: "visible", timeout: 8_000 });
  }

  async waitForErrorToast() {
    await this.errorToast.waitFor({ state: "visible", timeout: 8_000 });
  }
}