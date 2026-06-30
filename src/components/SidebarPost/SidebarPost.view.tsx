import Link from "next/link";
import { padCount } from "@/lib/formatters";
import styles from "@/app/homepage.module.css";

export type SidebarPostProps = {
  title: string;
  slug: string;
  excerpt?: string;
  readingTime: number;
  index: number;
};

export function SidebarPostView({ title, slug, excerpt, readingTime, index }: SidebarPostProps) {
  return (
    <div className={styles.stackItem}>
      <span className={styles.stackNum}>{padCount(index + 2)}</span>
      <h4>
        <Link href={`/${slug}`}>{title}</Link>
      </h4>
      {excerpt && <p>{excerpt}</p>}
      <div className={styles.stackMeta}>
        DISPATCH · {readingTime} MIN
      </div>
    </div>
  );
}
