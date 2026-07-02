"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface CommentRow {
  id: number;
  postId: number | null;
  fieldNoteId: number | null;
  parentId: number | null;
  body: string;
  createdAt: Date;
  authorName: string | null;
  authorImage: string | null;
}

type Props =
  | { postId: number; fieldNoteId?: never; initialComments: CommentRow[] }
  | { fieldNoteId: number; postId?: never; initialComments: CommentRow[] };

export default function CommentSection({ postId, fieldNoteId, initialComments }: Props) {
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
      body: JSON.stringify({ postId, fieldNoteId, body }),
    });

    setSubmitting(false);
    if (res.ok) {
      setBody("");
      setSubmitted(true);
    }
  }

  return (
    <>
    <section className="mt-6 mb-6 border-[3px] border-ink bg-paper p-10 text-center shadow-[4px_5px_0_rgba(58,46,28,0.08)]">
      <h2 className="mb-3 text-[10px] font-bold uppercase tracking-4 text-accent">In the margins</h2>
      
      {status === "loading" ? null : session ? (
        submitted ? (
          <p className="text-sm">
            Be patient. Around here we still let humans decide.
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
              <span className="text-sm">{session.user?.name}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="ml-auto text-xs"
              >
                Sign out
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="All additions welcome. No deductions tolerated."
              required
              className="w-full flex-1 border-[1.5px] border-ink bg-parchment px-3.5 py-3 text-ink outline-none placeholder:text-muted"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="cursor-pointer border-[1.5px] border-accent bg-accent px-6 py-3 font-figtree text-[11px] font-bold uppercase tracking-2 text-white transition-transform duration-100 ease-out hover:-translate-y-px"
              >
                {submitting ? "Sharpening pencils…" : "Contribute"}
              </button>
              <p className="text-xs text-gray-400">Comments appear after moderation.</p>
            </div>
          </form>
        )
      ) : (
        <div className="">
          <p className="mb-3 text-sm">Sign in to contribute.</p>
          <div className="gap-2 display inline-flex justify-center">
            <button
              onClick={() => signIn("github")}
              className="cursor-pointer border-[1.5px] border-accent bg-accent px-6 py-3 font-figtree text-[11px] font-bold uppercase tracking-2 text-white transition-transform duration-100 ease-out hover:-translate-y-px"
            >
              GitHub
            </button>
            <button
              onClick={() => signIn("google")}
              className="cursor-pointer border-[1.5px] border-accent bg-accent px-6 py-3 font-figtree text-[11px] font-bold uppercase tracking-2 text-white transition-transform duration-100 ease-out hover:-translate-y-px"
            >
              Google
            </button>
          </div>
        </div>
      )}
    </section>
    <h3 className="mb-6 text-[10px] font-bold uppercase tracking-4 text-accent">
        {list.length !== 0 ? `${list.length} ` : "No "}Contribution{list.length !== 1 ? "s" : ""}
      </h3>

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
                <p className="text-sm font-medium">
                  {c.authorName ?? "Anonymous"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {c.body}
                </p>
                <time className="mt-1 block text-xs">
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
</>
  );
}
