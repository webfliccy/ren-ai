export type KickerProps = {
  tag: string;
  crumb?: string;
  variant?: "accent" | "ink";
  inline?: boolean;
};

export function KickerView({ tag, crumb, variant = "accent", inline = false }: KickerProps) {
  return (
    <div className={`${inline ? "inline-flex" : "flex"} items-center gap-2.5`}>
      <span
        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white ${
          variant === "accent" ? "bg-accent" : "bg-ink"
        }`}
      >
        {tag}
      </span>
      {crumb && <span className="font-courier text-[11px] tracking-[0.04em] text-ink-light">{crumb}</span>}
    </div>
  );
}
