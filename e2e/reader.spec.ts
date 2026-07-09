import { test, expect } from "@playwright/test";
import { RICH_POST } from "./fixtures";

test.describe("reader journey", () => {
  test("home page links through to a post that renders its content", async ({
    page,
  }) => {
    await page.goto("/");

    // Position-agnostic: the post may be the lead or a sidebar item depending
    // on what the admin spec has published in a parallel worker.
    await page
      .getByRole("link", { name: RICH_POST.title, exact: true })
      .first()
      .click();

    await expect(page).toHaveURL(`/${RICH_POST.slug}`);
    await expect(
      page.getByRole("heading", { level: 1, name: RICH_POST.title }),
    ).toBeVisible();

    // The markdown pipeline rendered real structure, not escaped text.
    await expect(
      page.getByRole("heading", { name: "The Difference Engine" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "plans survive" }),
    ).toBeVisible();
    await expect(page.getByText("Gears as memory")).toBeVisible();
  });
});

test.describe("public pages smoke", () => {
  const pages = [
    { path: "/dispatches", marker: "Essays & experiment logs" },
    { path: "/issues", marker: "The Archive" },
    { path: "/about", marker: "About the Fan" },
    // No tools are seeded, so the workshop shows its empty state.
    { path: "/tools", marker: "Nothing in the workshop yet." },
  ];

  for (const { path, marker } of pages) {
    test(`${path} loads and renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByText(marker).first()).toBeVisible();
    });
  }
});
