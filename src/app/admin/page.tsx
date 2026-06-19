import CommentModerationCard from "@/components/CommentModerationCard";
import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Admin — ren·ai" };

export default async function AdminPage() {
  const [allPosts, pendingComments] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.updatedAt)),
    db
      .select({
        id: comments.id,
        body: comments.body,
        createdAt: comments.createdAt,
        authorName: users.name,
        postTitle: posts.title,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .leftJoin(posts, eq(comments.postId, posts.id))
      .where(eq(comments.approved, false))
      .orderBy(asc(comments.createdAt)),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </form>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New post
          </Link>
        </div>
        {allPosts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {allPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">{post.slug}</p>
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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Pending comments
          {pendingComments.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {pendingComments.length}
            </span>
          )}
        </h2>
        {pendingComments.length === 0 ? (
          <p className="text-gray-400">No comments awaiting moderation.</p>
        ) : (
          <div className="space-y-3">
            {pendingComments.map((c) => (
              <CommentModerationCard
                key={c.id}
                id={c.id}
                authorName={c.authorName ?? null}
                postTitle={c.postTitle ?? null}
                body={c.body}
                createdAt={c.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
