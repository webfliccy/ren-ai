"use client";

import { Artefact, ExperimentRecord, FieldNote, Issue } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { btnPrimary, btnSecondary, errorBanner, inputClass, labelClass, selectClass } from "@/lib/styles";
import { FormField } from "./FormField";
import { ArtefactList } from "./ArtefactList";
import { ReferenceList } from "./ReferenceList";
import { TagInput } from "./TagInput";
import { parseTags } from "@/lib/tags";
import { ChicagoWebRef, parseRefs } from "@/lib/references";
import { OutcomeStatus, OUTCOME_STATUS_LABELS, OUTCOME_STATUS_COLOURS } from "@/lib/outcome-status";
import { EMPTY_EXPERIMENT, parseExperiment } from "@/lib/experiment";
import { toDateInputValue } from "@/lib/formatters";
import { parseJson } from "@/lib/parse";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });


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
    parseJson(note?.artefacts ?? "[]", [] as Artefact[])
  );
  const [uploading, setUploading] = useState(false);

  // References
  const [references, setReferences] = useState<ChicagoWebRef[]>(() =>
    parseRefs(note?.references ?? "[]")
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) setSlug(slugify(value));
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
      references,
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

  const sectionClass = "rounded-md border border-gray-200 p-4 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={errorBanner}>{error}</div>
      )}

      {/* ── Core fields ──────────────────────────────────────────────── */}
      <FormField label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="Experiment title"
          className={inputClass}
        />
      </FormField>

      <FormField label="Slug">
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
          required
          placeholder="experiment-title"
          className={`${inputClass} font-mono`}
        />
      </FormField>

      <FormField label="Excerpt">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary of this field note"
          className={inputClass}
        />
      </FormField>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <FormField label="Content">
        <RichEditor content={content} onChange={setContent} tables />
      </FormField>

      {/* ── Outcome ──────────────────────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Outcome</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Status">
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
          </FormField>

          <FormField label="Date closed">
            <input
              type="date"
              value={outcomeDateClosed}
              onChange={(e) => setOutcomeDateClosed(e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Number of runs">
            <input
              type="number"
              min={0}
              value={outcomeRuns}
              onChange={(e) => setOutcomeRuns(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </FormField>
        </div>
      </fieldset>

      {/* ── Experimentation Record ───────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Experimentation Record</legend>

        <FormField label="Hypothesis">
          <textarea
            value={experiment.hypothesis}
            onChange={(e) => setExperimentField("hypothesis", e.target.value)}
            rows={2}
            placeholder="What we expected to find"
            className={inputClass}
          />
        </FormField>

        <FormField label="Method">
          <textarea
            value={experiment.method}
            onChange={(e) => setExperimentField("method", e.target.value)}
            rows={3}
            placeholder="How the experiment was conducted"
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Model">
            <input
              type="text"
              value={experiment.model}
              onChange={(e) => setExperimentField("model", e.target.value)}
              placeholder="e.g. claude-sonnet-4-6"
              className={inputClass}
            />
          </FormField>

          <FormField label="Trials">
            <input
              type="number"
              min={0}
              value={experiment.trials ?? ""}
              onChange={(e) => setExperimentField("trials", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </FormField>

          <FormField label="Duration">
            <input
              type="text"
              value={experiment.duration}
              onChange={(e) => setExperimentField("duration", e.target.value)}
              placeholder="e.g. 3 days"
              className={inputClass}
            />
          </FormField>

          <FormField label="Scored by">
            <input
              type="text"
              value={experiment.scoredBy}
              onChange={(e) => setExperimentField("scoredBy", e.target.value)}
              placeholder="e.g. human raters, automated eval"
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Outcome">
          <textarea
            value={experiment.outcome}
            onChange={(e) => setExperimentField("outcome", e.target.value)}
            rows={2}
            placeholder="What actually happened"
            className={inputClass}
          />
        </FormField>
      </fieldset>

      {/* ── Artefacts ────────────────────────────────────────────────── */}
      <fieldset className={sectionClass}>
        <legend className="px-1 text-sm font-semibold text-gray-800">Artefacts</legend>
        <ArtefactList
          artefacts={artefacts}
          onUpdate={updateArtefact}
          onRemove={(i) => setArtefacts((a) => a.filter((_, j) => j !== i))}
          onUpload={handleArtefactUpload}
          uploading={uploading}
        />
      </fieldset>

      {/* ── References ───────────────────────────────────────────────── */}
      <ReferenceList references={references} onChange={setReferences} />

      {/* ── Tags ─────────────────────────────────────────────────────── */}
      <FormField label="Tags">
        <TagInput tags={tags} onChange={setTags} />
      </FormField>

      {/* ── Status & Issue ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className={selectClass}
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
            className={selectClass}
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
            className={btnPrimary}
          >
            {saving ? "Saving…" : isEditing ? "Update field note" : "Create field note"}
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
            Delete field note
          </button>
        )}
      </div>
    </form>
  );
}
