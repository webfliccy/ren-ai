import type { FieldNote } from "@/db/schema";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";

export type FieldNoteCardProps = {
  note: FieldNote;
  /** "grid": side-by-side 3-column layout (issue pages).
   *  "list": stacked vertical index layout (dispatches index). */
  layout?: "grid" | "list";
};

export function FieldNoteCard({ note, layout = "grid" }: FieldNoteCardProps) {
  const wrapperClasses =
    layout === "list"
      ? "flex flex-col border-t border-rule px-0 py-7"
      : "flex flex-col border-l border-rule px-7 py-1 first:border-l-0 first:pl-0 last:pr-0 max-tablet:border-l-0 max-tablet:border-b max-tablet:border-dashed max-tablet:border-border max-tablet:px-0 max-tablet:pt-0 max-tablet:pb-6";

  return (
    <article className={wrapperClasses}>
      <div className="mb-2.5 font-courier text-[9.5px] font-bold tracking-1 text-accent uppercase">
        Field Note
      </div>
      <h4 className="mb-2.5 font-cormorant text-[28px] leading-[1.04] font-semibold text-balance">
        <Link
          className="no-underline hover:text-accent"
          href={`/dispatches/${note.slug}`}
        >
          {note.title}
        </Link>
      </h4>
      {note.excerpt && (
        <p className="mb-3.5 font-newsreader text-[15px] leading-[1.55] text-ink-light">
          {note.excerpt}
        </p>
      )}
      <div className="mt-auto flex justify-between gap-2 border-t border-dashed border-border pt-3 font-courier text-[9.5px] tracking-[0.04em] text-muted">
        {note.outcomeStatus && (
          <span className="text-accent">
            {note.outcomeStatus.toUpperCase()}
          </span>
        )}
        {note.publishedAt && <span>{formatDate(note.publishedAt)}</span>}
      </div>
    </article>
  );
}
