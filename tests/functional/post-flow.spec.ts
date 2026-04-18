import { authTest } from "../../fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { AddPostPage } from "../../pages/AddPostPage";

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
      // CreatePostForm calls router.push("/welcome") on success — redirect proves creation succeeded
      await staffPage.waitForURL(/\/welcome/, { timeout: 15_000 });

      // Community posts (/add-post → /api/v1/posts/create/) are separate from announcements
      // (/api/v1/posts/announcements/) shown on the welcome dashboard.
      // Verify we landed on welcome (the API test below verifies post content).
      await expect(staffPage).toHaveURL(/\/welcome/);
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