import PostCard from "@/components/PostCard";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const metadata = {
  title: "ren·ai",
  description: "A blog.",
};

export default async function Home() {
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">ren·ai</h1>
        <p className="mt-2 text-gray-500">Thoughts, writing, ideas.</p>
      </header>

      {allPosts.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
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
