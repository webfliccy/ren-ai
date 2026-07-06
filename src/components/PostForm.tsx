"use client";

import { Issue, Post } from "@/db/schema";
import { ChicagoWebRef, parseRefs } from "@/lib/references";
import { slugify } from "@/lib/slug";
import { btnPrimary, btnSecondary, errorBanner, hintText, inputClass, labelClass } from "@/lib/styles";
import { FormField } from "./FormField";
import { ReferenceList } from "./ReferenceList";
import { TagInput } from "./TagInput";
import { SanitizedSvg } from "@/components/SanitizedSvg";
import { toDateInputValue } from "@/lib/formatters";
import { parseTags } from "@/lib/tags";
import { createPostAction, updatePostAction, deletePostAction } from "@/actions/posts";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

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
  const [tokens, setTokens] = useState(post?.tokens ?? "");
  const [references, setReferences] = useState<ChicagoWebRef[]>(() =>
    parseRefs(post?.references ?? "[]")
  );
  const [hindsight, setHindsight] = useState(post?.hindsight ?? "");
  const [hindsightAddedAt, setHindsightAddedAt] = useState(
    toDateInputValue(post?.hindsightAddedAt)
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [ogImage, setOgImage] = useState(post?.ogImage ?? "");
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title, content, excerpt, prompt: prompt || null, figSvg: figSvg || null, status, featured, tags,
      issueId: issueId ?? null,
      tokens: tokens || null,
      references,
      hindsight,
      hindsightAddedAt: hindsightAddedAt || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogImage: ogImage || null,
    };

    try {
      if (isEditing) {
        const result = await updatePostAction(post.id, { ...payload, slug });
        if (!result) {
          setError("Post not found");
          setSaving(false);
          return;
        }
      } else {
        await createPostAction(payload);
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Delete this post? This cannot be undone.")) return;
    await deletePostAction(post.id);
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={errorBanner}>{error}</div>
      )}

      <FormField label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="My post title"
          className={inputClass}
        />
      </FormField>

      <FormField label="Slug">
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
          required
          placeholder="my-post-title"
          className={`${inputClass} font-mono`}
        />
      </FormField>

      <FormField label="Excerpt">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short description shown in post listings"
          className={inputClass}
        />
      </FormField>

      <FormField label={<>Prompt <span className={hintText}>(shown in Production Record — separate from excerpt)</span></>}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="The prompt or brief given to the AI for this piece"
          className={inputClass}
        />
      </FormField>

      <FormField label={<>FIG. 1 — Article illustration <span className={hintText}>(.svg)</span></>}>
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
            <SanitizedSvg
              className="flex items-center justify-center [&>svg]:max-h-40 [&>svg]:w-full"
              svg={figSvg}
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
      </FormField>

      <FormField label="Content">
        <RichEditor content={content} onChange={setContent} />
      </FormField>

      <FormField label="Tags">
        <TagInput tags={tags} onChange={setTags} />
      </FormField>

      <FormField label={<>Tokens <span className={hintText}>(e.g. ~24,000 ⟵ ~8,200)</span></>}>
        <input
          type="text"
          value={tokens}
          onChange={(e) => setTokens(e.target.value)}
          placeholder="input ⟵ output"
          className={`${inputClass} font-mono`}
        />
      </FormField>

      <ReferenceList references={references} onChange={setReferences} />

      <fieldset className="rounded-md border border-gray-200 p-4 space-y-4">
        <legend className="px-1 text-sm font-semibold text-gray-800">Hindsight</legend>
        <p className={hintText}>
          Post-release amendment shown at the top of the article. Leave empty to omit; the
          publish date is never changed.
        </p>
        <FormField label="Note">
          <RichEditor content={hindsight} onChange={setHindsight} />
        </FormField>
        <FormField label={<>Added on <span className={hintText}>(defaults to today when first saved)</span></>}>
          <input
            type="date"
            value={hindsightAddedAt}
            onChange={(e) => setHindsightAddedAt(e.target.value)}
            className={inputClass}
          />
        </FormField>
      </fieldset>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className={labelClass}>Status</label>
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
          <span className={labelClass}>Feature story</span>
          <span className="text-xs text-gray-400">(hero slot on homepage)</span>
        </label>

        <div className="flex items-center gap-3">
          <label className={labelClass}>Issue</label>
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
              <label className={labelClass}>
                SEO title <span className={hintText}>(defaults to post title)</span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>
                SEO description <span className={hintText}>(defaults to excerpt)</span>
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder={excerpt}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>OG / cover image URL</label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://..."
                className={inputClass}
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
            className={btnPrimary}
          >
            {saving ? "Saving…" : isEditing ? "Update post" : "Create post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className={btnSecondary}
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
