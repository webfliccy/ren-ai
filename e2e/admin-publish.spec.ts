import { test, expect } from "@playwright/test";
import { E2E_ADMIN_SECRET } from "./env";

// Unique per run so reuseExistingServer never collides with a previous run's
// post (the slug column is unique).
const RUN_ID = Date.now().toString(36);
const TITLE = `Robot Lifecycle Dispatch ${RUN_ID}`;
const BODY = "This paragraph was typed by a robot during an end-to-end test.";

test("a post can be drafted, stays private, then publishes to the public site", async ({
  page,
}) => {
  // ── Log in through the real form ──────────────────────────────────────────
  await page.goto("/admin/login");
  await page.locator('input[type="password"]').fill(E2E_ADMIN_SECRET);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/admin");

  // ── Create a draft ─────────────────────────────────────────────────────────
  await page.getByRole("link", { name: "New post" }).click();
  await page.getByPlaceholder("My post title").fill(TITLE);
  // The form derives the slug from the title; read it back rather than
  // re-implementing slugify in the test.
  const slug = await page.getByPlaceholder("my-post-title").inputValue();
  expect(slug).not.toBe("");

  await page.locator(".tiptap").first().click();
  await page.keyboard.type(BODY);

  // Status defaults to draft; save as-is.
  await page.getByRole("button", { name: "Create post" }).click();
  await expect(page).toHaveURL("/admin");

  // ── The draft must not be public ───────────────────────────────────────────
  const draftResponse = await page.goto(`/${slug}`);
  expect(draftResponse?.status()).toBe(404);

  await page.goto("/");
  await expect(page.getByRole("link", { name: TITLE })).toHaveCount(0);

  // ── Publish via the edit page ──────────────────────────────────────────────
  await page.goto("/admin");
  await page.getByRole("link", { name: TITLE }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/\d+\/edit/);
  await expect(page.getByPlaceholder("My post title")).toHaveValue(TITLE);

  await page
    .locator('select:has(option[value="draft"])')
    .selectOption("published");
  await page.getByRole("button", { name: "Update post" }).click();
  await expect(page).toHaveURL("/admin");

  // ── Now it renders publicly ────────────────────────────────────────────────
  await page.goto(`/${slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: TITLE }),
  ).toBeVisible();
  await expect(page.getByText(BODY)).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("link", { name: TITLE, exact: true }).first(),
  ).toBeVisible();
});
