import { ReactNode } from "react";

export type SpecCardProps = {
  title: string;
  fig?: string;
  compact?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

export function SpecCardView({
  title,
  fig,
  compact = false,
  footer,
  children,
}: SpecCardProps) {
  const titleClasses = compact
    ? "text-[10px] tracking-[0.2em]"
    : "text-[10.5px] tracking-4";
  const figClasses = compact
    ? "text-[8.5px] tracking-1"
    : "text-[9px] tracking-2";

  return (
    <>
      <details
        className="group mobile-collapsible border-[1.5px] border-ink bg-paper shadow-paper"
        suppressHydrationWarning
      >
        <summary
          className={`flex cursor-pointer list-none items-center justify-between bg-ink text-parchment ${
            compact ? "px-3 py-[7px]" : "px-3.5 py-2"
          }`}
        >
          <span className={`font-courier font-bold uppercase ${titleClasses}`}>
            {title}
          </span>
          <span className="flex items-center gap-2">
            {fig && (
              <span className={`font-courier opacity-70 ${figClasses}`}>
                {fig}
              </span>
            )}
            <svg
              className="h-2.5 w-2.5 shrink-0 text-parchment/70 transition-transform duration-200 group-open:rotate-180"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 4.5L6 8l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div>
          {children}
          {footer && (
            <div className="flex items-center gap-2 border-t border-ink px-3.5 py-[7px] font-courier text-[9.5px] text-ink-light">
              {footer}
            </div>
          )}
        </div>
      </details>
      {/* Defaults open above the mobile breakpoint. Setting the real `open`
          attribute (rather than faking visibility with CSS) is required:
          Chromium's <details> wraps closed content in an internal
          ::details-content node that author CSS cannot force-display. */}
      <script suppressHydrationWarning>
        {
          'document.currentScript.previousElementSibling.open = window.matchMedia("(min-width: 760px)").matches;'
        }
      </script>
    </>
  );
}
