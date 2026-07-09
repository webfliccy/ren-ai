// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

afterEach(cleanup);
import { SpecCardView } from "./SpecCard.view";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  mockMatchMedia(false);
});

// Desktop-open is applied via a ref callback rather than an inline <script>:
// Next.js client-side navigations mount components through React's renderer
// instead of the browser's HTML parser, and scripts inserted that way never
// execute, so a script-based approach only opens on a hard reload.
test("opens by default at desktop widths", () => {
  mockMatchMedia(true);
  render(
    <SpecCardView title="Experimentation Record" fig="FIG. 2-B">
      <p>Row content</p>
    </SpecCardView>,
  );

  const details = screen.getByText("Row content").closest("details");
  expect(details?.open).toBe(true);
  expect(details?.className).toContain("mobile-collapsible");
  expect(screen.getByText("Experimentation Record")).toBeDefined();
  expect(screen.getByText("FIG. 2-B")).toBeDefined();
});

test("renders closed by default at mobile widths", () => {
  mockMatchMedia(false);
  render(
    <SpecCardView title="Experimentation Record" fig="FIG. 2-B">
      <p>Row content</p>
    </SpecCardView>,
  );

  const details = screen.getByText("Row content").closest("details");
  expect(details?.open).toBe(false);
});

test("renders the footer inside the collapsible body when provided", () => {
  render(
    <SpecCardView title="Outcome Record" footer={<span>Signed off</span>}>
      <p>Row content</p>
    </SpecCardView>,
  );

  expect(screen.getByText("Signed off")).toBeDefined();
});
