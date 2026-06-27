import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/db";
import { Artefact, ExperimentRecord, fieldNotes } from "@/db/schema";
import { formatDate } from "@/lib/formatters";
import { renderMarkdown } from "@/lib/markdown";
import { OUTCOME_STATUS_LABELS } from "@/lib/outcome-status";
import { parseJson } from "@/lib/parse";
import { fileExt, formatSize } from "@/lib/file-utils";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import styles from "../field-notes.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [note] = await db.select().from(fieldNotes).where(eq(fieldNotes.slug, slug));
  if (!note) return {};
  return {
    title: `${note.title} — Field Notes — ren·ai`,
    description: note.excerpt ?? undefined,
  };
}

export default async function FieldNoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const [note] = await db.select().from(fieldNotes).where(eq(fieldNotes.slug, slug));

  if (!note || note.status !== "published") notFound();

  const experiment = parseJson<ExperimentRecord>(note.experiment, {
    hypothesis: "", method: "", model: "", trials: null,
    duration: "", scoredBy: "", outcome: "",
  });
  const artefacts = parseJson<Artefact[]>(note.artefacts, []);

  const publishedDate = note.publishedAt ? formatDate(new Date(note.publishedAt)) : null;
  const closedDate = note.outcomeDateClosed ? formatDate(new Date(note.outcomeDateClosed)) : null;
  const outcome = note.outcomeStatus;

  const hasExperiment = experiment.hypothesis || experiment.method || experiment.model ||
    experiment.trials != null || experiment.duration || experiment.scoredBy || experiment.outcome;

  const hasOutcome = outcome || closedDate || note.outcomeRuns != null;

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <SiteHeader activePath="/field-notes" />
        <div style={{ height: 4 }} />
        <div className={styles.ruleThin} />

        <article className={styles.article}>
          <div className={styles.kicker}>
            <span className={styles.kickerTag}>Field Notes</span>
            <span className={styles.kickerCrumb}>
              {note.slug.replace(/-/g, " ").toUpperCase().slice(0, 44)}
            </span>
          </div>

          <h1 className={styles.headline}>{note.title}</h1>

          {note.excerpt && <p className={styles.deck}>{note.excerpt}</p>}

          <div className={styles.byline}>
            {outcome && (
              <span className={`${styles.bylineLabel}`}>
                {OUTCOME_STATUS_LABELS[outcome] ?? outcome}
              </span>
            )}
            {outcome && publishedDate && <span className={styles.bylineDot} />}
            {publishedDate && <time dateTime={note.publishedAt?.toISOString()}>{publishedDate}</time>}
            {note.outcomeRuns != null && (
              <>
                <span className={styles.bylineDot} />
                <span>{note.outcomeRuns} run{note.outcomeRuns !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>

          {/* ── Experimentation Record ─────────────────── */}
          {hasExperiment && (
            <section className={styles.spec} aria-label="Experimentation record">
              <div className={styles.specHead}>
                <span className={styles.specHeadTitle}>Experimentation Record</span>
                <span className={styles.specHeadFig}>FIG. 2-B</span>
              </div>
              <div className={styles.specRows}>
                {experiment.hypothesis && (
                  <div className={`${styles.specRow} ${styles.specRowFull}`}>
                    <span className={styles.specKey}>Hypothesis</span>
                    <span className={styles.specVal}>{experiment.hypothesis}</span>
                  </div>
                )}
                {experiment.model && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Model</span>
                    <span className={`${styles.specVal} ${styles.red}`}>{experiment.model}</span>
                  </div>
                )}
                {experiment.trials != null && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Trials</span>
                    <span className={styles.specVal}>{experiment.trials}</span>
                  </div>
                )}
                {experiment.duration && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Duration</span>
                    <span className={styles.specVal}>{experiment.duration}</span>
                  </div>
                )}
                {experiment.scoredBy && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Scored by</span>
                    <span className={styles.specVal}>{experiment.scoredBy}</span>
                  </div>
                )}
                {experiment.method && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Method</span>
                    <span className={styles.specVal}>{experiment.method}</span>
                  </div>
                )}
                {experiment.outcome && (
                  <div className={styles.specRow}>
                    <span className={styles.specKey}>Outcome</span>
                    <span className={styles.specVal}>{experiment.outcome}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {note.content && (
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
            />
          )}

          {/* ── Outcome ───────────────────────────────── */}
          {hasOutcome && (
            <section className={styles.outcome} aria-label="Outcome">
              <div className={styles.outcomeHead}>
                <span className={styles.outcomeHeadTitle}>Outcome Record</span>
                <span className={styles.outcomeHeadFig}>FIG. 2-A</span>
              </div>
              <div className={styles.outcomeRows}>
                <div className={styles.outcomeRow}>
                  <span className={styles.outcomeKey}>Status</span>
                  {outcome ? (
                    <span className={`${styles.outcomeVal} ${styles.outcomeValBadge} ${styles[outcome]}`}>
                      {OUTCOME_STATUS_LABELS[outcome] ?? outcome}
                    </span>
                  ) : (
                    <span className={`${styles.outcomeVal} ${styles.muted}`}>—</span>
                  )}
                </div>
                <div className={styles.outcomeRow}>
                  <span className={styles.outcomeKey}>Date closed</span>
                  <span className={`${styles.outcomeVal} ${!closedDate ? styles.muted : ""}`}>
                    {closedDate ?? "—"}
                  </span>
                </div>
                <div className={styles.outcomeRow}>
                  <span className={styles.outcomeKey}>Runs</span>
                  <span className={`${styles.outcomeVal} ${note.outcomeRuns == null ? styles.muted : ""}`}>
                    {note.outcomeRuns ?? "—"}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ── Artefacts ────────────────────────────── */}
          {artefacts.length > 0 && (
            <section className={styles.artefacts} aria-label="Artefacts">
              <div className={styles.artefactsHead}>
                <span className={styles.artefactsHeadTitle}>Artefacts</span>
                <span className={styles.artefactsHeadFig}>FIG. 2-C</span>
              </div>
              <ul className={styles.artefactsList}>
                {artefacts.map((art, i) => (
                  <li key={i} className={styles.artefactItem}>
                    <span className={styles.artefactType}>{fileExt(art.name)}</span>
                    <div className={styles.artefactBody}>
                      <span className={styles.artefactName}>{art.name}</span>
                      {art.description && (
                        <p className={styles.artefactDesc}>{art.description}</p>
                      )}
                    </div>
                    {art.size != null && (
                      <span className={styles.artefactSize}>{formatSize(art.size)}</span>
                    )}
                    <a
                      href={art.url}
                      download
                      className={styles.artefactDownload}
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <SiteFooter />
      </div>
    </div>
  );
}
