import { defineConfig, devices } from "@playwright/test";
import {
  E2E_ADMIN_SECRET,
  E2E_BASE_URL,
  E2E_DB_PATH,
  E2E_PORT,
} from "./e2e/env";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Mirrors the Dockerfile's runner stage (COPY public, .next/standalone,
    // .next/static, then `node server.js`) so the suite runs the same
    // server `next start` warns is incompatible with `output: "standalone"`.
    command:
      "pnpm exec tsx e2e/seed.ts && pnpm run build && " +
      "cp -r public .next/standalone/public && " +
      "cp -r .next/static .next/standalone/.next/static && " +
      "node .next/standalone/server.js",
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      PORT: String(E2E_PORT),
      NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
      TURSO_DATABASE_URL: `file:${E2E_DB_PATH}`,
      // Explicitly blank out anything from .env.local that could point the
      // server at real infrastructure.
      TURSO_AUTH_TOKEN: "",
      AWS_REGION: "",
      AWS_ACCESS_KEY_ID: "",
      AWS_SECRET_ACCESS_KEY: "",
      S3_BUCKET: "",
      ADMIN_SECRET: E2E_ADMIN_SECRET,
      AUTH_SECRET: "e2e-auth-secret",
      AUTH_GITHUB_ID: "e2e-github-id",
      AUTH_GITHUB_SECRET: "e2e-github-secret",
      AUTH_GOOGLE_ID: "e2e-google-id",
      AUTH_GOOGLE_SECRET: "e2e-google-secret",
    },
  },
});
