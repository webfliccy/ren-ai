"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface CommentRow {
  id: number;
  postId: number;
  parentId: number | null;
  body: string;
  createdAt: Date;
  authorName: string | null;
  authorImage: string | null;
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: CommentRow[];
}) {
  const { data: session, status } = useSession();
  const [list] = useState(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body }),
    });

    setSubmitting(false);
    if (res.ok) {
      setBody("");
      setSubmitted(true);
    }
  }

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        {list.length} Comment{list.length !== 1 ? "s" : ""}
      </h2>

      {list.length > 0 && (
        <div className="mb-8 space-y-6">
          {list.map((c) => (
            <div key={c.id} className="flex gap-3">
              {c.authorImage ? (
                <img
                  src={c.authorImage}
                  alt={c.authorName ?? ""}
                  className="h-8 w-8 shrink-0 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {c.authorName ?? "Anonymous"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                  {c.body}
                </p>
                <time className="mt-1 block text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "loading" ? null : session ? (
        submitted ? (
          <p className="text-sm text-gray-500">
            Thanks! Your comment is awaiting moderation.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="h-7 w-7 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">{session.user?.name}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
              >
                Sign out
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Leave a comment…"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Posting…" : "Post comment"}
              </button>
              <p className="text-xs text-gray-400">Comments appear after moderation.</p>
            </div>
          </form>
        )
      ) : (
        <div className="rounded-md border border-gray-200 p-5 text-center">
          <p className="mb-3 text-sm text-gray-500">Sign in to leave a comment.</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => signIn("github")}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              GitHub
            </button>
            <button
              onClick={() => signIn("google")}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Google
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
