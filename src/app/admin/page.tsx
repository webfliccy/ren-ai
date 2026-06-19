import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Admin — ren·ai" };

export default async function AdminPage() {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New post
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-600"
              formAction="/api/auth/logout"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {allPosts.length === 0 ? (
        <p className="text-gray-400">No posts yet. Create your first one.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {allPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 text-xs text-gray-400">
                  {post.slug}
                </p>
              </div>
              <span
                className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  post.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {post.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
