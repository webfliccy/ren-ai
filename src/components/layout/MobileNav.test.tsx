// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

afterEach(cleanup);

const mockPathname = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.value,
}));

import { MobileNav } from "./MobileNav";

test("panel is closed by default and opens on hamburger click", () => {
  render(<MobileNav topbarStamp="VOL. I · NO. 1" />);

  expect(screen.getByText("VOL. I · NO. 1")).toBeDefined();
  expect(
    screen.queryByRole("navigation", { name: "Site navigation" }),
  ).toBeNull();

  const toggle = screen.getByRole("button", { name: "Open navigation menu" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(toggle.getAttribute("aria-controls")).toBeNull();

  fireEvent.click(toggle);

  expect(
    screen.getByRole("navigation", { name: "Site navigation" }),
  ).toBeDefined();
  const closeButton = screen.getByRole("button", {
    name: "Close navigation menu",
  });
  expect(closeButton.getAttribute("aria-expanded")).toBe("true");
  expect(closeButton.getAttribute("aria-controls")).toBe("mobile-nav-panel");
  expect(
    screen.getByRole("link", { name: /Tools & Contraptions/ }),
  ).toBeDefined();
});

test("marks the link matching the current path as active", () => {
  mockPathname.value = "/tools";
  render(<MobileNav topbarStamp="VOL. I · NO. 1" />);

  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

  const active = screen.getByRole("link", { name: /Tools & Contraptions/ });
  const inactive = screen.getByRole("link", { name: /The Archive/ });
  expect(active.className).toContain("!text-accent");
  expect(inactive.className).not.toContain("!text-accent");

  mockPathname.value = "/";
});

test("clicking a nav link closes the panel even when it points at the current page", () => {
  mockPathname.value = "/tools";
  render(<MobileNav topbarStamp="VOL. I · NO. 1" />);

  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  expect(
    screen.getByRole("navigation", { name: "Site navigation" }),
  ).toBeDefined();

  fireEvent.click(screen.getByRole("link", { name: /Tools & Contraptions/ }));

  expect(
    screen.queryByRole("navigation", { name: "Site navigation" }),
  ).toBeNull();

  mockPathname.value = "/";
});

test("Escape key closes the open panel", () => {
  render(<MobileNav topbarStamp="VOL. I · NO. 1" />);

  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  expect(
    screen.getByRole("navigation", { name: "Site navigation" }),
  ).toBeDefined();

  fireEvent.keyDown(window, { key: "Escape" });

  expect(
    screen.queryByRole("navigation", { name: "Site navigation" }),
  ).toBeNull();
});

test("Escape restores focus to the toggle button when a panel link was focused", () => {
  render(<MobileNav topbarStamp="VOL. I · NO. 1" />);

  fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
  const link = screen.getByRole("link", { name: /Tools & Contraptions/ });
  link.focus();
  expect(document.activeElement).toBe(link);

  fireEvent.keyDown(window, { key: "Escape" });

  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Open navigation menu" }),
  );
});
