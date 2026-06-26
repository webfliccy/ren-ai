"use client";

import { Artefact, ExperimentRecord, FieldNote, Issue } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { parseTags } from "@/lib/tags";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

type OutcomeStatus = "pending" | "success" | "partial" | "failure" | "inconclusive";

const OUTCOME_STATUS_LABELS: Record<OutcomeStatus, string> = {
  pending: "Pending",
  success: "Success",
  partial: "Partial",
  failure: "Failure",
  inconclusive: "Inconclusive",
};

const OUTCOME_STATUS_COLOURS: Record<OutcomeStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failure: "bg-red-100 text-red-700",
  inconclusive: "bg-purple-100 text-purple-700",
};

const EMPTY_EXPERIMENT: ExperimentRecord = {
  hypothesis: "",
  method: "",
  model: "",
  trials: null,
  duration: "",
  scoredBy: "",
  outcome: "",
};

function parseExperiment(raw: string): ExperimentRecord {
  try { return { ...EMPTY_EXPERIMENT, ...JSON.parse(raw) }; } catch { return { ...EMPTY_EXPERIMENT }; }
}

function parseArtefacts(raw: string): Artefact[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function toDateInputValue(ts: Date | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

export default function FieldNoteForm({ note, issues = [] }: { note?: FieldNote; issues?: Pick<Issue, "id" | "number" | "title">[] }) {
  const router = useRouter();
  const isEditing = !!note;

  const [title, setTitle] = useState(note?.title ?? "");
  const [slug, setSlug] = useState(note?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [content, setContent] = useState(note?.content ?? "");
  const [excerpt, setExcerpt] = useState(note?.excerpt ?? "");
  const [issueId, setIssueId] = useState<number | null>(note?.issueId ?? null);
  const [status, setStatus] = useState<"draft" | "published">(note?.status ?? "draft");
  const [tags, setTags] = useState<string[]>(parseTags(note?.tags ?? "[]"));
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Outcome
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | "">(
    (note?.outcomeStatus as OutcomeStatus) ?? ""
  );
  const [outcomeDateClosed, setOutcomeDateClosed] = useState(
    toDateInputValue(note?.outcomeDateClosed)
  );
  const [outcomeRuns, setOutcomeRuns] = useState<string>(
    note?.outcomeRuns != null ? String(note.outcomeRuns) : ""
  );

  // Experimentation record
  const [experiment, setExperiment] = useState<ExperimentRecord>(
    parseExperiment(note?.experiment ?? "{}")
  );

  // Artefacts
  const [artefacts, setArtefacts] = useState<Artefact[]>(
    parseArtefacts(note?.artefacts ?? "[]")
  );
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) setSlug(slugify(value));
  }

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

  function setExperimentField<K extends keyof ExperimentRecord>(key: K, value: ExperimentRecord[K]) {
    setExperiment((e) => ({ ...e, [key]: value }));
  }

  async function handleArtefactUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      setError("Upload failed");
      return;
    }

    const data = await res.json();
    setArtefacts((a) => [
      ...a,
      { name: data.name, description: "", url: data.url, type: data.type, size: data.size },
    ]);
    e.target.value = "";
  }

  function updateArtefact(i: number, field: keyof Artefact, value: string | number | null) {
    setArtefacts((a) => a.map((x, j) => j === i ? { ...x, [field]: value } : x));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title, slug, content, excerpt, status, tags, issueId: issueId ?? null,
      outcomeStatus: outcomeStatus || null,
      outcomeDateClosed: outcomeDateClosed || null,
      outcomeRuns: outcomeRuns !== "" ? Number(outcomeRuns) : null,
      experiment,
      artefacts,
    };

    const res = isEditing
      ? await fetch(`/api/field-notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/field-notes", {
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
    router.push("/admin/field-notes");
    router.refresh();
  }

  async function handleDelete() {
    if (!note || !confirm("Delete this field note? This cannot be undone.")) return;
    await fetch(`/api/field-notes/${note.id}`, { method: "DELETE" });
    router.push("/admin/field-notes");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-sm font-medium text-gray-700";
  const sectionClass = "rounded-md border border-gray-200 p-4 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Core fields ──────────────────────────────────────────────── */}
      <div className="space-y-1">
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="Experiment title"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
          required
          placeholder="experiment-title"
          className={`${inputClass} font-mono`}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary of this field note"
          className={inputClass}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <label className={labelClass}>Content</label>
        <RichEditor content={content} onChange={setContent} tables />
      </div>

      {/* ── Outcome ──────────────────────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Outcome</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className={labelClass}>Status</label>
            <select
              value={outcomeStatus}
              onChange={(e) => setOutcomeStatus(e.target.value as OutcomeStatus | "")}
              className={inputClass}
            >
              <option value="">— Not set —</option>
              {(Object.keys(OUTCOME_STATUS_LABELS) as OutcomeStatus[]).map((s) => (
                <option key={s} value={s}>{OUTCOME_STATUS_LABELS[s]}</option>
              ))}
            </select>
            {outcomeStatus && (
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${OUTCOME_STATUS_COLOURS[outcomeStatus]}`}>
                {OUTCOME_STATUS_LABELS[outcomeStatus]}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Date closed</label>
            <input
              type="date"
              value={outcomeDateClosed}
              onChange={(e) => setOutcomeDateClosed(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Number of runs</label>
            <input
              type="number"
              min={0}
              value={outcomeRuns}
              onChange={(e) => setOutcomeRuns(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Experimentation Record ───────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Experimentation Record</legend>

        <div className="space-y-1">
          <label className={labelClass}>Hypothesis</label>
          <textarea
            value={experiment.hypothesis}
            onChange={(e) => setExperimentField("hypothesis", e.target.value)}
            rows={2}
            placeholder="What we expected to find"
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Method</label>
          <textarea
            value={experiment.method}
            onChange={(e) => setExperimentField("method", e.target.value)}
            rows={3}
            placeholder="How the experiment was conducted"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>Model</label>
            <input
              type="text"
              value={experiment.model}
              onChange={(e) => setExperimentField("model", e.target.value)}
              placeholder="e.g. claude-sonnet-4-6"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Trials</label>
            <input
              type="number"
              min={0}
              value={experiment.trials ?? ""}
              onChange={(e) => setExperimentField("trials", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Duration</label>
            <input
              type="text"
              value={experiment.duration}
              onChange={(e) => setExperimentField("duration", e.target.value)}
              placeholder="e.g. 3 days"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Scored by</label>
            <input
              type="text"
              value={experiment.scoredBy}
              onChange={(e) => setExperimentField("scoredBy", e.target.value)}
              placeholder="e.g. human raters, automated eval"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Outcome</label>
          <textarea
            value={experiment.outcome}
            onChange={(e) => setExperimentField("outcome", e.target.value)}
            rows={2}
            placeholder="What actually happened"
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* ── Artefacts ────────────────────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Artefacts</legend>

        {artefacts.length > 0 && (
          <ol className="space-y-3 list-none">
            {artefacts.map((art, i) => (
              <li key={i} className="rounded border border-gray-200 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                        {art.type || "file"}
                      </span>
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline truncate"
                      >
                        {art.name}
                      </a>
                      {art.size != null && (
                        <span className="text-xs text-gray-400">
                          {art.size < 1024
                            ? `${art.size} B`
                            : art.size < 1048576
                            ? `${(art.size / 1024).toFixed(1)} KB`
                            : `${(art.size / 1048576).toFixed(1)} MB`}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={art.description}
                      onChange={(e) => updateArtefact(i, "description", e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setArtefacts((a) => a.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none flex-shrink-0"
                    aria-label="Remove artefact"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload artefact</label>
          <input
            type="file"
            onChange={handleArtefactUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50"
          />
          {uploading && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
        </div>
      </fieldset>

      {/* ── Tags ─────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <label className={labelClass}>Tags</label>
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

      {/* ── Status & Issue ───────────────────────────────────────────── */}
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

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update field note" : "Create field note"}
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
            Delete field note
          </button>
        )}
      </div>
    </form>
  );
}
