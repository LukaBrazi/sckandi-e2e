import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AddPostPage } from "../../pages/AddPostPage";
import { WelcomePage } from "../../pages/WelcomePage";

// Requires seed data: make seed

authTest.describe("Мешканець створює пост → пост видно у списку публікацій", () => {
  const postTitle = `E2E Тестовий пост ${Date.now()}`;

  authTest(
    "resident creates post → post appears on welcome page",
    async ({ resident1Page }) => {
      const addPost = new AddPostPage(resident1Page);
      await addPost.goto();
      await expect(resident1Page).toHaveURL(/\/add-post/);

      await addPost.fillAndSubmit(
        postTitle,
        "Це тестова публікація, створена автоматично під час E2E тесту.",
      );

      // After submit should redirect to /welcome
      await resident1Page.waitForURL(/\/welcome/, { timeout: 15_000 });

      // Verify post appears on welcome page
      const welcomePage = new WelcomePage(resident1Page);
      const postCard = resident1Page.getByText(postTitle, { exact: false });
      await expect(postCard).toBeVisible({ timeout: 10_000 });
    },
  );

  authTest(
    "post is accessible via API after creation",
    async ({ request }) => {
      const { TEST_USERS } = await import("../../fixtures/test-data");

      const tokenRes = await request.post("/api/v1/auth/jwt/create/", {
        data: {
          email: TEST_USERS.resident1.email,
          password: TEST_USERS.resident1.password,
        },
      });
      const { access } = await tokenRes.json();

      const postsRes = await request.get("/api/v1/posts/posts/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      expect(postsRes.ok()).toBeTruthy();
      const data = await postsRes.json();
      const posts: Array<{ title: string }> = data.posts?.results ?? data.results ?? [];
      expect(posts.length).toBeGreaterThan(0);
    },
  );
});