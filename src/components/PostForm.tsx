"use client";

import { Post } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    post?.status ?? "draft"
  );
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { title, slug, content, excerpt, status };

    const res = isEditing
      ? await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!post || !confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="My post title"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          required
          placeholder="my-post-title"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short description shown in post listings"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs text-blue-600 hover:underline"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div
            className="prose prose-sm min-h-64 w-full rounded-md border border-gray-200 bg-white px-4 py-3"
            dangerouslySetInnerHTML={{ __html: renderMarkdownSimple(content) }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="Write your post in Markdown..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update post" : "Create post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete post
          </button>
        )}
      </div>
    </form>
  );
}

// Minimal client-side markdown renderer for the preview pane.
// The public post page uses marked (server-side) for full fidelity.
function renderMarkdownSimple(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|p|u|o|l|c])(.+)$/gm, "<p>$1</p>");
}
