// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { PostCardView } from "./PostCard.view";

test("renders title as a link", () => {
  render(
    <PostCardView
      title="An Essay on Machines"
      slug="an-essay-on-machines"
      readingTime={5}
      tags={[]}
    />,
  );
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
    "An Essay on Machines",
  );
  expect(screen.getByRole("link")).toHaveProperty(
    "pathname",
    "/an-essay-on-machines",
  );
});

test("renders excerpt when provided", () => {
  render(
    <PostCardView
      title="A"
      slug="a"
      excerpt="A short description"
      readingTime={1}
      tags={[]}
    />,
  );
  expect(screen.getByText("A short description")).toBeDefined();
});

test("renders formatted date and reading time", () => {
  render(
    <PostCardView
      title="B"
      slug="b"
      formattedDate="1 January 2026"
      publishedIso="2026-01-01T00:00:00.000Z"
      readingTime={3}
      tags={[]}
    />,
  );
  expect(screen.getByText("1 January 2026")).toBeDefined();
  expect(screen.getByText("3 min read")).toBeDefined();
});

test("renders tags", () => {
  render(
    <PostCardView title="C" slug="c" readingTime={2} tags={["ai", "ethics"]} />,
  );
  expect(screen.getByText("ai")).toBeDefined();
  expect(screen.getByText("ethics")).toBeDefined();
});
