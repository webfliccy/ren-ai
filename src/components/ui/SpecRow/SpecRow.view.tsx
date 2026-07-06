import { ReactNode } from "react";

export type SpecRowProps = {
  label: string;
  value: ReactNode;
  /** px width of the label column */
  keyWidth?: number;
  borderRight?: boolean;
  borderBottom?: boolean;
  colSpanFull?: boolean;
  italic?: boolean;
  compact?: boolean;
  /** px font-size for the value cell (non-compact only). Defaults to 12. */
  valueSize?: number;
};

export function SpecRowView({
  label,
  value,
  keyWidth = 116,
  borderRight = false,
  borderBottom = true,
  colSpanFull = false,
  italic = false,
  compact = false,
  valueSize = 12,
}: SpecRowProps) {
  return (
    <div
      className={`grid items-baseline ${compact ? "gap-2 px-3 py-[7px]" : "gap-2.5 px-3.5 py-[9px]"} ${
        borderBottom ? "border-b border-dashed border-border" : ""
      } ${borderRight ? "border-r border-dashed border-border" : ""} ${colSpanFull ? "col-span-2" : ""}`}
      style={{ gridTemplateColumns: `${keyWidth}px 1fr` }}
    >
      <span
        className={`font-courier font-bold whitespace-nowrap text-muted uppercase ${
          compact ? "text-[8.5px] tracking-[0.08em]" : "text-[9.5px] tracking-1"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-courier leading-[1.45] text-ink ${italic ? "italic" : ""}`}
        style={{ fontSize: compact ? 11 : valueSize }}
      >
        {value}
      </span>
    </div>
  );
}
