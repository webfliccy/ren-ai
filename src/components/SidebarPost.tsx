import type { Post } from "@/db/schema";
import { padCount } from "@/lib/formatters";
import Link from "next/link";
import styles from "@/app/homepage.module.css";

export function SidebarPost({ post, index }: { post: Post; index: number }) {
  return (
    <div className={styles.stackItem}>
      <span className={styles.stackNum}>{padCount(index + 2)}</span>
      <h4>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className={styles.stackMeta}>
        DISPATCH · {post.readingTime} MIN
      </div>
    </div>
  );
}
