"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RenaiLogo } from "@/components/RenaiLogo";
import { NAV, isActiveNavHref } from "./nav-items";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export function MobileNav({ topbarStamp }: { topbarStamp: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedForPathname, setOpenedForPathname] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  if (pathname !== openedForPathname) {
    setOpenedForPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Move focus off the panel before it unmounts — by the time an
        // effect cleanup could check, React has already removed the
        // focused link and the browser has already dropped focus to
        // <body>, so this can't be done reactively after the fact.
        if (container?.contains(document.activeElement)) toggle?.focus();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const focusable =
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`mobile:hidden ${open ? "fixed inset-x-5 inset-y-0 z-50 flex flex-col bg-parchment" : ""}`}
    >
      <div className="bg-parchment">
        <div className="flex w-full items-center gap-2.5 pt-5 pb-1">
          <div className="h-px flex-1 bg-rule" />
          <div className="text-[8px] font-bold tracking-[0.2em] whitespace-nowrap text-ink uppercase opacity-60">
            {topbarStamp}
          </div>
          <div className="h-px flex-1 bg-rule" />
        </div>
        <div className="h-[3px] bg-ink" />
        <div style={{ height: 2 }} />
        <div className="h-px bg-ink" />

        <div className="flex items-center justify-between px-5 py-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
            aria-label="The RenAIssance Fan — home"
            onClick={() => setOpen(false)}
          >
            <RenaiLogo className="h-8 w-auto" />
            <span className="font-cormorant text-[21px] leading-none font-medium text-ink italic">
              The Ren<span className="text-accent">AI</span>ssance Fan
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={open ? "mobile-nav-panel" : undefined}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center"
          >
            {open ? (
              <span className="relative block h-5 w-6" aria-hidden="true">
                <span className="absolute top-1/2 left-0 block h-[2px] w-6 -translate-y-1/2 rotate-45 bg-ink" />
                <span className="absolute top-1/2 left-0 block h-[2px] w-6 -translate-y-1/2 -rotate-45 bg-ink" />
              </span>
            ) : (
              <span className="flex w-6 flex-col gap-[5px]" aria-hidden="true">
                <span className="block h-[2px] w-full bg-ink" />
                <span className="block h-[2px] w-full bg-ink" />
                <span className="block h-[2px] w-full bg-ink" />
              </span>
            )}
          </button>
        </div>

        <div className="h-px bg-ink" />
        <div style={{ height: 2 }} />
        <div className="h-[3px] bg-ink" />
      </div>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Site navigation"
          className="flex-1 overflow-y-auto px-5"
        >
          {NAV.map(({ label, href }) => {
            const active = isActiveNavHref(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between border-b border-rule py-7 font-cormorant text-[30px] leading-[1.1] italic no-underline ${
                  active ? "!text-accent" : "text-ink"
                }`}
              >
                {label}
                <span
                  aria-hidden="true"
                  className={active ? "!text-accent" : "text-muted"}
                >
                  →
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
