"use client";

import { Issue, Tool } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "Command Line Interface",
  "AI Agent",
  "Workflow",
  "Skill",
  "Prompt",
];

export default function ToolForm({
  tool,
  issues,
  defaultIssueId,
}: {
  tool?: Tool;
  issues: Pick<Issue, "id" | "number" | "title">[];
  defaultIssueId?: number;
}) {
  const router = useRouter();
  const isEditing = !!tool;

  const [issueId, setIssueId] = useState<number>(
    tool?.issueId ?? defaultIssueId ?? issues[0]?.id ?? 0
  );
  const [category, setCategory] = useState(tool?.category ?? "");
  const [name, setName] = useState(tool?.name ?? "");
  const [illustration, setIllustration] = useState(tool?.illustration ?? "");
  const [descriptor, setDescriptor] = useState(tool?.descriptor ?? "");
  const [url, setUrl] = useState(tool?.url ?? "");
  const [status, setStatus] = useState<"draft" | "published">(tool?.status ?? "draft");
  const [sortOrder, setSortOrder] = useState(tool?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { issueId, category, name, illustration, descriptor, url, status, sortOrder };

    const res = isEditing
      ? await fetch(`/api/tools/${tool.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/tools", {
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
    if (!tool || !confirm("Delete this tool?")) return;
    await fetch(`/api/tools/${tool.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Issue */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Issue</label>
        <select
          value={issueId}
          onChange={(e) => setIssueId(Number(e.target.value))}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {issues.map((i) => (
            <option key={i.id} value={i.id}>
              № {i.number} — {i.title}
            </option>
          ))}
        </select>
      </div>

      {/* Category + Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <input
            list="tool-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Writing"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <datalist id="tool-categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Tool name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. The Provenance Stamp"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Descriptor */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Descriptor</label>
        <textarea
          value={descriptor}
          onChange={(e) => setDescriptor(e.target.value)}
          rows={3}
          placeholder="A short description shown on the card"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* URL */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Illustration (SVG) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Illustration{" "}
          <span className="font-normal text-gray-400">(raw SVG — paste the &lt;svg&gt; element)</span>
        </label>
        <textarea
          value={illustration}
          onChange={(e) => setIllustration(e.target.value)}
          rows={6}
          placeholder="<svg …>…</svg>"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          spellCheck={false}
        />
        {illustration && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-gray-400">Preview:</span>
            <div
              className="rounded border border-gray-100 bg-[#FAF6EE] p-2"
              dangerouslySetInnerHTML={{ __html: illustration }}
            />
          </div>
        )}
      </div>

      {/* Status + Sort order */}
      <div className="flex items-center gap-6">
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
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Sort order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
            className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update tool" : "Create tool"}
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
            Delete tool
          </button>
        )}
      </div>
    </form>
  );
}
