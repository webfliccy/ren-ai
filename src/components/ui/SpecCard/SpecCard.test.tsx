// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
import { SpecCardView } from "./SpecCard.view";

test("renders as a closed-by-default details/summary disclosure", () => {
  render(
    <SpecCardView title="Experimentation Record" fig="FIG. 2-B">
      <p>Row content</p>
    </SpecCardView>,
  );

  const details = screen.getByText("Row content").closest("details");
  expect(details).not.toBeNull();
  expect(details?.hasAttribute("open")).toBe(false);
  expect(details?.className).toContain("mobile-collapsible");
  expect(screen.getByText("Experimentation Record")).toBeDefined();
  expect(screen.getByText("FIG. 2-B")).toBeDefined();

  // Desktop-open is set by a real `open` attribute via an inline script
  // (not a CSS override) — Chromium hides closed <details> content in an
  // internal node that author CSS can't force-display.
  const script = details?.nextElementSibling;
  expect(script?.tagName).toBe("SCRIPT");
  expect(script?.innerHTML).toContain("window.matchMedia");
  expect(script?.innerHTML).toContain("previousElementSibling.open");
});

test("renders the footer inside the collapsible body when provided", () => {
  render(
    <SpecCardView title="Outcome Record" footer={<span>Signed off</span>}>
      <p>Row content</p>
    </SpecCardView>,
  );

  expect(screen.getByText("Signed off")).toBeDefined();
});
