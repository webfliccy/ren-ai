import { ProseMarkdown } from "@/components/ProseMarkdown";

export type HindsightNoteProps = {
  /** The hindsight note as markdown. */
  markdown: string;
  /** e.g. "2 July 2026" */
  formattedDate: string;
  addedIso?: string;
  /** e.g. "one week on" — omitted when the publication date is unknown. */
  interval?: string | null;
};

export function HindsightNoteView({ markdown, formattedDate, addedIso, interval }: HindsightNoteProps) {
  const dateline = interval ? `Added ${formattedDate} — ${interval}` : `Added ${formattedDate}`;

  return (
    <aside
      className="border-[1.5px] border-l-[5px] border-ink shadow-paper"
      aria-label="Hindsight"
    >
      <header className="flex items-center gap-4 border-b border-border py-1.5 pl-1.5 pr-2.5">
        <span className="bg-hindsight px-3 py-[5px] font-courier text-[10.5px] font-bold uppercase tracking-4 text-ink">
          Hindsight
        </span>
        <time dateTime={addedIso} className="font-courier text-[11px] tracking-2 text-ink-light">
          {dateline}
        </time>
        <span
          className="ml-auto border-[1.5px] border-hindsight px-2 py-[3px] font-courier text-[11px] font-bold tracking-1 text-ink"
          aria-hidden
        >
          20:20
        </span>
      </header>
      <div className="bg-texture-hatch px-7 py-6 max-mobile:px-4 font-cormorant">
          <ProseMarkdown markdown={markdown} />
      </div>
    </aside>
  );
}
