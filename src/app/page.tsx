import PostCard from "@/components/PostCard";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, like } from "drizzle-orm";

export const metadata = {
  title: "ren·ai",
  description: "A blog.",
};

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { tag } = await searchParams;

  let query = db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .$dynamic();

  if (tag) {
    query = query.where(like(posts.tags, `%"${tag}"%`));
  }

  const allPosts = await query.orderBy(desc(posts.publishedAt));

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">ren·ai</h1>
        <p className="mt-2 text-gray-500">Thoughts, writing, ideas.</p>
      </header>

      {tag && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by tag:</span>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {tag}
          </span>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">
            Clear ×
          </a>
        </div>
      )}

      {allPosts.length === 0 ? (
        <p className="text-gray-400">{tag ? `No posts tagged "${tag}".` : "No posts yet."}</p>
      ) : (
        <div>
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
