// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { SpecRowView } from "./SpecRow.view";

test("colSpanFull rows span every column of the parent grid", () => {
  // A hardcoded col-span-2 corrupts a max-mobile:grid-cols-1 parent grid
  // at mobile widths — it forces an implicit second column, laying
  // sibling rows out side by side instead of stacked. col-span-full
  // (grid-column: 1 / -1) spans whatever the current column count is,
  // so it's correct at every breakpoint without hardcoding one.
  render(<SpecRowView label="Hypothesis" value="Something true" colSpanFull />);

  const row = screen.getByText("Hypothesis").closest("div");
  expect(row?.className).toContain("col-span-full");
});

test("non-spanning rows carry no column-span class", () => {
  render(<SpecRowView label="Model" value="Opus 4.8" />);

  const row = screen.getByText("Model").closest("div");
  expect(row?.className).not.toContain("col-span");
});
