import { ReactNode } from "react";

export type BylineProps = {
  children: ReactNode;
  /** "full": border-top + border-bottom, used by article/field-note detail pages.
   *  "lead": border-top only, used by the homepage lead hero. */
  variant?: "full" | "lead";
};

export function BylineView({ children, variant = "full" }: BylineProps) {
  const isFull = variant === "full";
  return (
    <div
      className={`flex flex-wrap items-center text-ink-light ${
        isFull
          ? "gap-x-3.5 gap-y-2 border-y border-rule py-3.5 text-[13px]"
          : "gap-x-3 gap-y-[7px] border-t border-rule pt-4 text-[12.5px]"
      }`}
    >
      {children}
    </div>
  );
}

export function BylineDotView() {
  return <span className="h-[3px] w-[3px] rounded-full bg-muted" />;
}

export function BylineWhoView({ children }: { children: ReactNode }) {
  return <span className="font-bold tracking-[0.01em] text-ink">{children}</span>;
}

export type BylineBadgeProps = {
  children: ReactNode;
  /** "accent": red border/text, used by article/dispatch bylines.
   *  "ink": ink border/text, used by field-note bylines. */
  variant?: "accent" | "ink";
  /** "sm" (9px) is used by the homepage lead hero, "default" (10px) elsewhere. */
  size?: "sm" | "default";
};

export function BylineBadgeView({ children, variant = "accent", size = "default" }: BylineBadgeProps) {
  return (
    <span
      className={`inline-block border px-1.5 py-px font-courier uppercase tracking-[0.06em] ${
        size === "sm" ? "text-[9px]" : "text-[10px]"
      } ${variant === "accent" ? "border-accent text-accent" : "border-ink text-ink"}`}
    >
      {children}
    </span>
  );
}
