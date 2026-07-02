import type { FieldNote } from "@/db/schema";
import Link from "next/link";
import styles from "@/app/(site)/homepage.module.css";

export function SidebarFieldNote({ note, num }: { note: FieldNote; num: string }) {
  return (
    <div className={styles.stackItem}>
      <span className={styles.stackNum}>{num}</span>
      <h4>
        <Link href={`/field-notes/${note.slug}`}>{note.title}</Link>
      </h4>
      {note.excerpt && <p>{note.excerpt}</p>}
      <div className={styles.stackMeta}>
        FIELD NOTE{note.outcomeStatus ? ` · ${note.outcomeStatus.toUpperCase()}` : ""}
      </div>
    </div>
  );
}
