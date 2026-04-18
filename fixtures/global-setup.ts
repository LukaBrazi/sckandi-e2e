/**
 * Global setup — runs once before the whole test suite.
 *
 * Previously self-seeded Issue records and healed tenant@demo.com's
 * apartment FK because the old `seed_demo` didn't cover those.  After
 * the 2026-04-18 `seed_demo` rewrite (see `server/apps/common/seed/`),
 * the backend populates all of that itself, so this file is a thin
 * log-only hook.  Kept as a stub in case future suites need a pre-run
 * step (hence the warning-on-failure style below).
 */

import type { FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL =
    process.env.BASE_URL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:8080";

  // eslint-disable-next-line no-console
  console.log(`[global-setup] baseURL=${baseURL} (no-op; seed_demo covers data)`);
}
