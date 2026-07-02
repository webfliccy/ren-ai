import type { FieldNote } from "@/db/schema";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";
import styles from "@/app/(site)/homepage.module.css";

export function FieldNoteCard({ note }: { note: FieldNote }) {
  return (
    <article className={styles.dispatch}>
      <div className={styles.dispatchTag}>Field Note</div>
      <h4>
        <Link href={`/field-notes/${note.slug}`}>{note.title}</Link>
      </h4>
      {note.excerpt && <p>{note.excerpt}</p>}
      <div className={styles.dispatchFoot}>
        {note.outcomeStatus && (
          <span className={styles.red}>{note.outcomeStatus.toUpperCase()}</span>
        )}
        {note.publishedAt && <span>{formatDate(note.publishedAt)}</span>}
      </div>
    </article>
  );
}
