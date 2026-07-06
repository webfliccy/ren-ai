// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { ContinueReadingView } from "./ContinueReading.view";

test("renders the issue number in the heading", () => {
  render(<ContinueReadingView items={[]} issueNumber={4} />);
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
    "Also in Issue No. 4",
  );
});

test("renders each item title as a link", () => {
  render(
    <ContinueReadingView
      items={[
        {
          kind: "post",
          id: 1,
          slug: "notes-on-uncertainty",
          title: "Notes on Uncertainty",
          readingTime: 4,
        },
        {
          kind: "fieldNote",
          id: 2,
          slug: "the-long-tail",
          title: "The Long Tail",
        },
      ]}
      issueNumber={2}
    />,
  );
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0]).toHaveProperty("pathname", "/notes-on-uncertainty");
  expect(links[1]).toHaveProperty("pathname", "/dispatches/the-long-tail");
});

test("renders reading time in dispatch meta for posts", () => {
  render(
    <ContinueReadingView
      items={[{ kind: "post", id: 1, slug: "a", title: "A", readingTime: 7 }]}
      issueNumber={1}
    />,
  );
  expect(screen.getByText("DISPATCH · 7 MIN")).toBeDefined();
});

test("hides dispatch meta when a post's reading time is 0", () => {
  render(
    <ContinueReadingView
      items={[{ kind: "post", id: 1, slug: "a", title: "A", readingTime: 0 }]}
      issueNumber={1}
    />,
  );
  expect(screen.queryByText(/DISPATCH/)).toBeNull();
});

test("renders field note meta with outcome status", () => {
  render(
    <ContinueReadingView
      items={[
        {
          kind: "fieldNote",
          id: 1,
          slug: "a",
          title: "A",
          outcomeStatus: "success",
        },
      ]}
      issueNumber={1}
    />,
  );
  expect(screen.getByText("FIELD NOTE · SUCCESS")).toBeDefined();
});

test("renders plain FIELD NOTE meta when no outcome status is set", () => {
  render(
    <ContinueReadingView
      items={[{ kind: "fieldNote", id: 1, slug: "a", title: "A" }]}
      issueNumber={1}
    />,
  );
  expect(screen.getByText("FIELD NOTE")).toBeDefined();
});
