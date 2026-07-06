// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { HindsightNoteView } from "./HindsightNote.view";

test("renders the hindsight label, dateline and 20:20 badge", () => {
  render(
    <HindsightNoteView
      markdown="The shoulders go further down than I claimed."
      formattedDate="2 July 2026"
      addedIso="2026-07-02T00:00:00.000Z"
      interval="one week on"
    />,
  );
  expect(screen.getByText("Hindsight")).toBeDefined();
  expect(screen.getByText("Added 2 July 2026 — one week on")).toBeDefined();
  expect(screen.getByText("20:20")).toBeDefined();
  expect(
    screen.getByText("The shoulders go further down than I claimed."),
  ).toBeDefined();
});

test("omits the interval when publication date is unknown", () => {
  render(<HindsightNoteView markdown="Note." formattedDate="2 July 2026" />);
  expect(screen.getByText("Added 2 July 2026")).toBeDefined();
});

test("renders markdown emphasis and links as elements", () => {
  render(
    <HindsightNoteView
      markdown="In a *sermon by [Robert Burton](https://example.com/burton)* (1621)."
      formattedDate="2 July 2026"
    />,
  );
  const link = screen.getByRole("link", { name: "Robert Burton" });
  expect(link.getAttribute("href")).toBe("https://example.com/burton");
  expect(link.closest("em")).not.toBeNull();
});

test("raw HTML in the note is inert text, not markup", () => {
  render(
    <HindsightNoteView
      markdown={'Beware <img src="x" onerror="steal()"> tags.'}
      formattedDate="2 July 2026"
    />,
  );
  expect(document.querySelector("img")).toBeNull();
});

test("javascript: link targets are stripped", () => {
  render(
    <HindsightNoteView
      markdown="[click me](javascript:alert(1))"
      formattedDate="2 July 2026"
    />,
  );
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.getByText("click me")).toBeDefined();
});
