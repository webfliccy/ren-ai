// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { SidebarPostView } from "./SidebarPost.view";

test("renders title as a link with correct href", () => {
  render(
    <SidebarPostView
      title="Notes on Uncertainty"
      slug="notes-on-uncertainty"
      readingTime={4}
      index={0}
    />
  );
  expect(screen.getByRole("heading", { level: 4 }).textContent).toBe("Notes on Uncertainty");
  expect(screen.getByRole("link")).toHaveProperty("pathname", "/notes-on-uncertainty");
});

test("renders index counter offset by 2", () => {
  render(
    <SidebarPostView title="B" slug="b" readingTime={2} index={0} />
  );
  expect(screen.getByText("02")).toBeDefined();
});

test("renders excerpt when provided", () => {
  render(
    <SidebarPostView
      title="C"
      slug="c"
      excerpt="A brief summary"
      readingTime={3}
      index={1}
    />
  );
  expect(screen.getByText("A brief summary")).toBeDefined();
});

test("renders reading time in dispatch meta", () => {
  render(
    <SidebarPostView title="D" slug="d" readingTime={7} index={2} />
  );
  expect(screen.getByText("DISPATCH · 7 MIN")).toBeDefined();
});
