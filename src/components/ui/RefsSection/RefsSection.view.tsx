import { ReactNode } from "react";

export type RefsSectionProps = {
  /** The <ol className="bib">...</ol> list of citations. */
  children: ReactNode;
  note?: string;
};

const DEFAULT_NOTE =
  "Citations follow Chicago Manual of Style — Notes & Bibliography (web) format.";

export function RefsSectionView({
  children,
  note = DEFAULT_NOTE,
}: RefsSectionProps) {
  return (
    <section
      className="mx-auto mt-14 max-w-[720px] pt-1"
      aria-label="References"
    >
      <div className="mb-2 flex items-center gap-3.5">
        <h2 className="font-cormorant text-[26px] font-semibold whitespace-nowrap text-ink">
          References
        </h2>
        <div className="h-px flex-1 bg-rule" />
      </div>
      <p className="mb-[22px] font-figtree text-[12.5px] leading-[1.55] text-ink-light italic">
        {note}
      </p>
      {children}
    </section>
  );
}
