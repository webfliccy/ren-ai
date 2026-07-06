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
    <section className="border-[1.5px] border-ink bg-paper shadow-paper">
      <div
        className={`flex items-center justify-between bg-ink text-parchment ${
          compact ? "px-3 py-[7px]" : "px-3.5 py-2"
        }`}
      >
        <span className={`font-courier font-bold uppercase ${titleClasses}`}>
          {title}
        </span>
        {fig && (
          <span className={`font-courier opacity-70 ${figClasses}`}>{fig}</span>
        )}
      </div>
      {children}
      {footer && (
        <div className="flex items-center gap-2 border-t border-ink px-3.5 py-[7px] font-courier text-[9.5px] text-ink-light">
          {footer}
        </div>
      )}
    </section>
  );
}
