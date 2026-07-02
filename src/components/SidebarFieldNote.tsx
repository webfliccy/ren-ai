import type { FieldNote } from "@/db/schema";
import Link from "next/link";

export function SidebarFieldNote({ note, num }: { note: FieldNote; num: string }) {
  return (
    <div className="border-b border-dashed border-border py-4 last:border-b-0">
      <span className="font-courier text-[11px] font-bold text-accent">{num}</span>
      <h4 className="mt-1 mb-1.5 font-cormorant text-2xl font-semibold leading-[1.08]">
        <Link className="no-underline hover:text-accent" href={`/field-notes/${note.slug}`}>{note.title}</Link>
      </h4>
      {note.excerpt && <p className="text-[13px] leading-[1.5] text-ink-light">{note.excerpt}</p>}
      <div className="mt-2 font-courier text-[9.5px] tracking-[0.04em] text-muted">
        FIELD NOTE{note.outcomeStatus ? ` · ${note.outcomeStatus.toUpperCase()}` : ""}
      </div>
    </div>
  );
}
