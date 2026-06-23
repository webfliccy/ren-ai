"use client";

import { Issue } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IssueForm({ issue }: { issue?: Issue }) {
  const router = useRouter();
  const isEditing = !!issue;

  const [number, setNumber] = useState(issue?.number ?? "");
  const [title, setTitle] = useState(issue?.title ?? "");
  const [description, setDescription] = useState(issue?.description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(issue?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { number: Number(number), title, description, status };

    const res = isEditing
      ? await fetch(`/api/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/issues", {
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
    if (!issue || !confirm("Delete this issue? Posts assigned to it will be unassigned.")) return;
    await fetch(`/api/issues/${issue.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Issue №</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            min={1}
            placeholder="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-3 space-y-1">
          <label className="text-sm font-medium text-gray-700">Theme title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. The Unreliable Narrator"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Description <span className="font-normal text-gray-400">(shown in the archive and as the issue deck)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A short editorial note on this issue's theme"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
            {saving ? "Saving…" : isEditing ? "Update issue" : "Create issue"}
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
            Delete issue
          </button>
        )}
      </div>
    </form>
  );
}
