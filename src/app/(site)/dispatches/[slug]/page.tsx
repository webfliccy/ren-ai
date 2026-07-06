import CommentSection from "@/components/CommentSection";
import { ContinueReading } from "@/components/ContinueReading";
import { ReferenceCitation } from "@/components/ReferenceCitation";
import { HindsightNote } from "@/components/ui/HindsightNote";
import { Kicker } from "@/components/ui/Kicker";
import { Byline, BylineDot, BylineBadge } from "@/components/ui/Byline";
import { SpecCard } from "@/components/ui/SpecCard";
import { SpecRow } from "@/components/ui/SpecRow";
import { OutcomeBadge } from "@/components/ui/OutcomeBadge";
import { RefsSection } from "@/components/ui/RefsSection";
import { db } from "@/db";
import {
  Artefact,
  ExperimentRecord,
  comments,
  fieldNotes,
  users,
} from "@/db/schema";
import { formatDate } from "@/lib/formatters";
import { formatIntervalOn } from "@/lib/hindsight";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import { OUTCOME_STATUS_LABELS } from "@/lib/outcome-status";
import { parseJson } from "@/lib/parse";
import { parseRefs } from "@/lib/references";
import { fileExt, formatSize } from "@/lib/file-utils";
import { getIssueById, getIssueSiblings } from "@/services/issues";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [note] = await db
    .select()
    .from(fieldNotes)
    .where(eq(fieldNotes.slug, slug));
  if (!note) return {};
  return {
    title: `${note.title} — Field Notes — ren·ai`,
    description: note.excerpt ?? undefined,
  };
}

export default async function FieldNoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const [note] = await db
    .select()
    .from(fieldNotes)
    .where(eq(fieldNotes.slug, slug));

  if (!note || note.status !== "published") notFound();

  const experiment = parseJson<ExperimentRecord>(note.experiment, {
    hypothesis: "",
    method: "",
    model: "",
    trials: null,
    duration: "",
    scoredBy: "",
    outcome: "",
  });
  const artefacts = parseJson<Artefact[]>(note.artefacts, []);
  const refs = parseRefs(note.references);

  const approvedComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      fieldNoteId: comments.fieldNoteId,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.fieldNoteId, note.id), eq(comments.approved, true)))
    .orderBy(asc(comments.createdAt));

  const [issue, siblingItems] = note.issueId
    ? await Promise.all([
        getIssueById(note.issueId),
        getIssueSiblings(note.issueId, { kind: "fieldNote", id: note.id }),
      ])
    : [null, []];

  const publishedDate = note.publishedAt
    ? formatDate(new Date(note.publishedAt))
    : null;
  const closedDate = note.outcomeDateClosed
    ? formatDate(new Date(note.outcomeDateClosed))
    : null;
  const outcome = note.outcomeStatus;

  const hasExperiment =
    experiment.hypothesis ||
    experiment.method ||
    experiment.model ||
    experiment.trials != null ||
    experiment.duration ||
    experiment.scoredBy ||
    experiment.outcome;

  const hasOutcome = outcome || closedDate || note.outcomeRuns != null;

  const specRows: {
    label: string;
    value: ReactNode;
    full?: boolean;
    italic?: boolean;
  }[] = [];
  if (experiment.hypothesis)
    specRows.push({
      label: "Hypothesis",
      value: experiment.hypothesis,
      full: true,
      italic: true,
    });
  if (experiment.model)
    specRows.push({
      label: "Model",
      value: <span className="text-accent">{experiment.model}</span>,
    });
  if (experiment.trials != null)
    specRows.push({ label: "Trials", value: experiment.trials });
  if (experiment.duration)
    specRows.push({ label: "Duration", value: experiment.duration });
  if (experiment.scoredBy)
    specRows.push({ label: "Scored by", value: experiment.scoredBy });
  if (experiment.method)
    specRows.push({ label: "Method", value: experiment.method });
  if (experiment.outcome)
    specRows.push({ label: "Outcome", value: experiment.outcome });

  const outcomeRows: { label: string; value: ReactNode }[] = [
    {
      label: "Status",
      value: outcome ? (
        <OutcomeBadge outcome={outcome} />
      ) : (
        <span className="text-muted">—</span>
      ),
    },
    {
      label: "Date closed",
      value: closedDate ?? <span className="text-muted">—</span>,
    },
    {
      label: "Runs",
      value: note.outcomeRuns ?? <span className="text-muted">—</span>,
    },
  ];

  return (
    <>
      <article className="mx-auto mt-12 max-w-[740px]">
        <div className="mb-[22px]">
          <Kicker
            variant="ink"
            tag="Field Notes"
            crumb={note.slug.replace(/-/g, " ").toUpperCase().slice(0, 44)}
          />
        </div>

        <h1 className="mb-5 font-cormorant text-[60px] leading-[1.02] font-semibold tracking-[-0.015em] text-balance text-ink max-mobile:text-[40px]">
          {note.title}
        </h1>

        {note.excerpt && (
          <p className="mb-[26px] font-newsreader text-[21px] leading-[1.5] text-pretty text-ink-light italic">
            {note.excerpt}
          </p>
        )}

        <Byline variant="full">
          {outcome && (
            <BylineBadge variant="ink">
              {OUTCOME_STATUS_LABELS[outcome] ?? outcome}
            </BylineBadge>
          )}
          {outcome && publishedDate && <BylineDot />}
          {publishedDate && (
            <time dateTime={note.publishedAt?.toISOString()}>
              {publishedDate}
            </time>
          )}
          {note.outcomeRuns != null && (
            <>
              <BylineDot />
              <span>
                {note.outcomeRuns} run{note.outcomeRuns !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </Byline>

        {/* ── Hindsight amendment ────────────────────── */}
        {note.hindsight && note.hindsightAddedAt && (
          <div className="mt-9">
            <HindsightNote
              markdown={note.hindsight}
              formattedDate={formatDate(new Date(note.hindsightAddedAt))}
              addedIso={note.hindsightAddedAt.toISOString()}
              interval={
                note.publishedAt
                  ? formatIntervalOn(
                      new Date(note.publishedAt),
                      new Date(note.hindsightAddedAt),
                    )
                  : null
              }
            />
          </div>
        )}

        {/* ── Experimentation Record ─────────────────── */}
        {hasExperiment && (
          <div className="mt-6">
            <SpecCard title="Experimentation Record" fig="FIG. 2-B">
              <div className="grid grid-cols-2 max-mobile:grid-cols-1">
                {specRows.map((row, i) => (
                  <SpecRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    italic={row.italic}
                    colSpanFull={row.full}
                    borderRight={!row.full && i % 2 === 0}
                  />
                ))}
              </div>
            </SpecCard>
          </div>
        )}

        {note.content && (
          <MarkdownHtml
            className="prose-dispatch prose"
            markdown={note.content}
          />
        )}

        {/* ── Outcome ───────────────────────────────── */}
        {hasOutcome && (
          <div className="mt-12">
            <SpecCard title="Outcome Record" fig="FIG. 2-A">
              <div className="grid grid-cols-3 max-mobile:grid-cols-1">
                {outcomeRows.map((row, i) => (
                  <SpecRow
                    key={row.label}
                    keyWidth={100}
                    label={row.label}
                    value={row.value}
                    valueSize={13}
                    borderRight={i !== outcomeRows.length - 1}
                  />
                ))}
              </div>
            </SpecCard>
          </div>
        )}

        {/* ── Artefacts ────────────────────────────── */}
        {artefacts.length > 0 && (
          <div className="mt-6">
            <SpecCard title="Artefacts" fig="FIG. 2-C">
              <ul className="py-1">
                {artefacts.map((art, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-3 border-b border-dashed border-border px-3.5 py-2.5 last:border-b-0"
                  >
                    <span className="min-w-[60px] font-courier text-[9px] font-bold tracking-1 whitespace-nowrap text-muted uppercase">
                      {fileExt(art.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-courier text-[13px] font-bold text-ink">
                        {art.name}
                      </span>
                      {art.description && (
                        <p className="mt-0.5 font-figtree text-xs text-ink-light">
                          {art.description}
                        </p>
                      )}
                    </div>
                    {art.size != null && (
                      <span className="flex-shrink-0 font-courier text-[10px] whitespace-nowrap text-muted">
                        {formatSize(art.size)}
                      </span>
                    )}
                    <a
                      href={art.url}
                      download
                      className="flex-shrink-0 border border-border px-2 py-0.5 font-courier text-[9px] font-bold tracking-[0.08em] whitespace-nowrap text-ink uppercase no-underline hover:border-accent hover:text-accent"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </SpecCard>
          </div>
        )}

        {/* ── References ───────────────────────────── */}
        {refs.length > 0 && (
          <RefsSection>
            <ol className="bib">
              {refs.map((ref, i) => (
                <li key={i}>
                  <ReferenceCitation reference={ref} />
                </li>
              ))}
            </ol>
          </RefsSection>
        )}
      </article>

      {/* ── Continue Reading ────────────────────────── */}
      {issue && siblingItems.length > 0 && (
        <ContinueReading items={siblingItems} issueNumber={issue.number} />
      )}

      <section className="mx-auto mt-14 max-w-[720px] border-t-[3px] border-ink pt-3.5">
        <CommentSection
          fieldNoteId={note.id}
          initialComments={approvedComments}
        />
      </section>
    </>
  );
}
