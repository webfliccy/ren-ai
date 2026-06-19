import { Post } from "@/db/schema";
import Link from "next/link";

export default function PostCard({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="group border-b border-gray-100 py-8 last:border-0">
      <Link href={`/${post.slug}`} className="block space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-500 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        {date && (
          <time className="text-sm text-gray-400" dateTime={post.publishedAt?.toISOString()}>
            {date}
          </time>
        )}
      </Link>
    </article>
  );
}
