import CommentModerationCard from "@/components/CommentModerationCard";
import { db } from "@/db";
import { comments, fieldNotes, issues, posts, subscribers, tools, users } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Admin — ren·ai" };

export default async function AdminPage() {
  const [allIssues, allPosts, allTools, allFieldNotes, pendingComments, allSubscribers] = await Promise.all([
    db.select().from(issues).orderBy(desc(issues.number)),
    db.select().from(posts).orderBy(desc(posts.updatedAt)),
    db
      .select({
        id: tools.id,
        issueId: tools.issueId,
        name: tools.name,
        category: tools.category,
        status: tools.status,
        issueNumber: issues.number,
        issueTitle: issues.title,
      })
      .from(tools)
      .leftJoin(issues, eq(tools.issueId, issues.id))
      .orderBy(desc(issues.number), asc(tools.sortOrder)),
    db.select({ id: fieldNotes.id, title: fieldNotes.title, status: fieldNotes.status, outcomeStatus: fieldNotes.outcomeStatus }).from(fieldNotes).orderBy(desc(fieldNotes.createdAt)),
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
    db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt)),
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
          <h2 className="text-lg font-semibold text-gray-900">Issues</h2>
          <Link
            href="/admin/issues/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New issue
          </Link>
        </div>
        {allIssues.length === 0 ? (
          <p className="text-gray-400">No issues yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {allIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/issues/${issue.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-blue-600"
                  >
                    № {issue.number} — {issue.title}
                  </Link>
                  {issue.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{issue.description}</p>
                  )}
                </div>
                <span
                  className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    issue.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tools &amp; Contraptions</h2>
          <Link
            href="/admin/tools/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New tool
          </Link>
        </div>
        {allTools.length === 0 ? (
          <p className="text-gray-400">No tools yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {allTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/tools/${tool.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-blue-600"
                  >
                    {tool.name}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {tool.category ? `${tool.category} · ` : ""}
                    {tool.issueNumber !== null && tool.issueNumber !== undefined
                      ? `Issue № ${tool.issueNumber} — ${tool.issueTitle}`
                      : "No issue"}
                  </p>
                </div>
                <span
                  className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tool.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tool.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <span className="font-medium text-gray-900">About the Fan</span>
              <p className="mt-0.5 text-xs text-gray-400">/about</p>
            </div>
            <Link
              href="/admin/about"
              className="ml-4 shrink-0 text-sm text-blue-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>
      </section>

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Field Notes</h2>
          <Link
            href="/admin/field-notes/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New field note
          </Link>
        </div>
        {allFieldNotes.length === 0 ? (
          <p className="text-gray-400">No field notes yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {allFieldNotes.map((note) => (
              <div key={note.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/field-notes/${note.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-blue-600"
                  >
                    {note.title}
                  </Link>
                  {note.outcomeStatus && (
                    <p className="mt-0.5 text-xs text-gray-400 capitalize">{note.outcomeStatus}</p>
                  )}
                </div>
                <span
                  className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    note.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {note.status}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2">
          <Link href="/admin/field-notes" className="text-xs text-gray-400 hover:text-gray-700">
            View all field notes →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Subscribers
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {allSubscribers.length}
          </span>
        </h2>
        {allSubscribers.length === 0 ? (
          <p className="text-gray-400">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {allSubscribers.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-mono text-sm text-gray-900">{sub.email}</span>
                <span className="text-xs text-gray-400">
                  {sub.subscribedAt
                    ? new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(sub.subscribedAt)
                    : "—"}
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
