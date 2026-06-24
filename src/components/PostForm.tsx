"use client";

import { Issue, Post } from "@/db/schema";
import { ChicagoWebRef, EMPTY_REF, parseRefs } from "@/lib/references";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function PostForm({ post, issues = [] }: { post?: Post; issues?: Pick<Issue, "id" | "number" | "title">[] }) {
  const router = useRouter();
  const isEditing = !!post;

  const [issueId, setIssueId] = useState<number | null>(post?.issueId ?? null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [prompt, setPrompt] = useState(post?.prompt ?? "");
  const [figSvg, setFigSvg] = useState(post?.figSvg ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [tags, setTags] = useState<string[]>(parseTags(post?.tags ?? "[]"));
  const [tagInput, setTagInput] = useState("");
  const [tokens, setTokens] = useState(post?.tokens ?? "");
  const [references, setReferences] = useState<ChicagoWebRef[]>(() =>
    parseRefs(post?.references ?? "[]")
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [ogImage, setOgImage] = useState(post?.ogImage ?? "");
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugManuallyEdited) setSlug(slugify(title));
  }, [title, slugManuallyEdited]);

  function addTag(value: string) {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (normalized && !tags.includes(normalized)) {
      setTags((t) => [...t, normalized]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((t) => t.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title, slug, content, excerpt, prompt: prompt || null, figSvg: figSvg || null, status, featured, tags,
      issueId: issueId ?? null,
      tokens: tokens || null,
      references,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogImage: ogImage || null,
    };

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
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
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
        <label className="text-sm font-medium text-gray-700">
          Prompt <span className="font-normal text-gray-400">(shown in Production Record — separate from excerpt)</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="The prompt or brief given to the AI for this piece"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          FIG. 1 — Article illustration <span className="font-normal text-gray-400">(.svg)</span>
        </label>
        <input
          type="file"
          accept=".svg,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => setFigSvg((ev.target?.result as string) ?? "");
            reader.readAsText(file);
          }}
          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
        />
        {figSvg && (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <div
              className="flex items-center justify-center [&>svg]:max-h-40 [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: figSvg }}
            />
            <button
              type="button"
              onClick={() => setFigSvg("")}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Content</label>
        <RichEditor content={content} onChange={setContent} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div
          className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 px-2 py-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-text"
          onClick={() => tagInputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {tag}
              <button type="button" onClick={() => setTags((t) => t.filter((x) => x !== tag))} className="text-blue-400 hover:text-blue-600">×</button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => tagInput && addTag(tagInput)}
            placeholder={tags.length === 0 ? "Add tags (Enter to confirm)" : ""}
            className="min-w-24 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <p className="text-xs text-gray-400">Press Enter or comma to add a tag</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Tokens <span className="font-normal text-gray-400">(e.g. ~24,000 ⟵ ~8,200)</span>
        </label>
        <input
          type="text"
          value={tokens}
          onChange={(e) => setTokens(e.target.value)}
          placeholder="input ⟵ output"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            References <span className="font-normal text-gray-400">(Chicago — web)</span>
          </label>
          <button
            type="button"
            onClick={() => setReferences((r) => [...r, { ...EMPTY_REF }])}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            + Add reference
          </button>
        </div>
        {references.length > 0 && (
          <ol className="space-y-4 list-none">
            {references.map((ref, i) => {
              const field = (key: keyof ChicagoWebRef, placeholder: string, label: string) => (
                <div className="space-y-0.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <input
                    type="text"
                    value={ref[key]}
                    onChange={(e) =>
                      setReferences((r) =>
                        r.map((v, j) => j === i ? { ...v, [key]: e.target.value } : v)
                      )
                    }
                    placeholder={placeholder}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              );
              return (
                <li key={i} className="rounded-md border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-400 select-none">{i + 1}.</span>
                    <button
                      type="button"
                      onClick={() => setReferences((r) => r.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none"
                      aria-label="Remove reference"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {field("authorLast", "Doe", "Author last name")}
                    {field("authorFirst", "John", "Author first name")}
                  </div>
                  {field("pageTitle", "The History of Chicago Architecture", "Title of webpage")}
                  {field("siteName", "Chicago Historical Society", "Name of website")}
                  {field("date", "Last modified October 12, 2025", "Publication / revision date")}
                  {field("url", "chicagohistory.org/...", "URL")}
                </li>
              );
            })}
          </ol>
        )}
        {references.length === 0 && (
          <p className="text-xs text-gray-400">No references yet — click &quot;+ Add reference&quot; to begin.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
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

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Feature story</span>
          <span className="text-xs text-gray-400">(hero slot on homepage)</span>
        </label>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Issue</label>
          <select
            value={issueId ?? ""}
            onChange={(e) => setIssueId(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">— No issue —</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                № {issue.number} — {issue.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-gray-200">
        <button
          type="button"
          onClick={() => setSeoOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          SEO & Open Graph
          <span className="text-gray-400">{seoOpen ? "▲" : "▼"}</span>
        </button>
        {seoOpen && (
          <div className="space-y-4 border-t border-gray-200 p-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                SEO title <span className="font-normal text-gray-400">(defaults to post title)</span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                SEO description <span className="font-normal text-gray-400">(defaults to excerpt)</span>
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder={excerpt}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">OG / cover image URL</label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
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
          <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
            Delete post
          </button>
        )}
      </div>
    </form>
  );
}
