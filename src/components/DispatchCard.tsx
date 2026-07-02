import type { Post } from "@/db/schema";
import { firstTag } from "@/lib/tags";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";
import styles from "@/app/(site)/homepage.module.css";

export function DispatchCard({ post }: { post: Post }) {
  return (
    <article className={styles.dispatch}>
      <div className={styles.dispatchTag}>{firstTag(post.tags) || "Dispatch"}</div>
      <h4>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className={styles.dispatchFoot}>
        <span>{post.readingTime} MIN READ</span>
        <span className={styles.red}>{formatDate(post.publishedAt)}</span>
      </div>
    </article>
  );
}
