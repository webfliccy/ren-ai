import { Post } from "@/db/schema";
import { parseTags } from "@/lib/tags";
import Link from "next/link";

export default function PostCard({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const tags = parseTags(post.tags);

  return (
    <article className="group border-b border-gray-100 py-8 last:border-0">
      <Link href={`/${post.slug}`} className="block space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 pt-1">
          {date && (
            <time className="text-sm text-gray-400" dateTime={post.publishedAt?.toISOString()}>
              {date}
            </time>
          )}
          {post.readingTime > 0 && (
            <span className="text-sm text-gray-400">{post.readingTime} min read</span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
