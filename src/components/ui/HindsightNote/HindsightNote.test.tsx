// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { HindsightNoteView } from "./HindsightNote.view";

test("renders the hindsight label, dateline and 20:20 badge", () => {
  render(
    <HindsightNoteView
      html="<p>The shoulders go further down than I claimed.</p>"
      formattedDate="2 July 2026"
      addedIso="2026-07-02T00:00:00.000Z"
      interval="one week on"
    />
  );
  expect(screen.getByText("Hindsight")).toBeDefined();
  expect(screen.getByText("Added 2 July 2026 — one week on")).toBeDefined();
  expect(screen.getByText("20:20")).toBeDefined();
  expect(screen.getByText("The shoulders go further down than I claimed.")).toBeDefined();
});

test("omits the interval when publication date is unknown", () => {
  render(
    <HindsightNoteView html="<p>Note.</p>" formattedDate="2 July 2026" />
  );
  expect(screen.getByText("Added 2 July 2026")).toBeDefined();
});
