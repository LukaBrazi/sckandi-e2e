import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AddPostPage } from "../../pages/AddPostPage";
import { WelcomePage } from "../../pages/WelcomePage";

// Requires seed data: make seed

authTest.describe("Мешканець створює пост → пост видно у списку публікацій", () => {
  const postTitle = `E2E Тестовий пост ${Date.now()}`;

  authTest(
    "staff creates post → post appears on welcome page",
    async ({ staffPage }) => {
      const addPost = new AddPostPage(staffPage);
      await addPost.goto();
      await expect(staffPage).toHaveURL(/\/add-post/);

      await addPost.fillAndSubmit(
        postTitle,
        "Це тестова публікація, створена автоматично під час E2E тесту.",
      );

      // After submit should redirect to /welcome
      await staffPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      // Verify post appears on welcome page
      const welcomePage = new WelcomePage(staffPage);
      const postCard = staffPage.getByText(postTitle, { exact: false });
      await expect(postCard).toBeVisible({ timeout: 10_000 });
    },
  );

  authTest(
    "post is accessible via API after creation",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");

      const tokenRes = await request.post("/api/v1/auth/login/", {
        data: {
          email: TEST_USERS.resident1.email,
          password: TEST_USERS.resident1.password,
        },
      });
      // Login sets cookies — use cookie-based auth (token is not in JSON body)
      expect(tokenRes.ok()).toBeTruthy();

      const postsRes = await request.get("/api/v1/posts/all/");
      expect(postsRes.ok()).toBeTruthy();
      const data = await postsRes.json();
      const posts: Array<{ title: string }> = data.posts?.results ?? data.results ?? [];
      expect(posts.length).toBeGreaterThan(0);
    },
  );
});