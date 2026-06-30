import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SubscribeForm from "@/components/SubscribeForm";
import { SidebarPost } from "@/components/SidebarPost";
import { DispatchCard } from "@/components/DispatchCard";
import { ToolCard } from "@/components/ToolCard";
import { getPostsByIssue } from "@/services/posts";
import { db } from "@/db";
import { issues, tools } from "@/db/schema";
import type { Post } from "@/db/schema";
import { formatDate, padCount } from "@/lib/formatters";
import { firstTag } from "@/lib/tags";
import { refCount } from "@/lib/references";
import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../homepage.module.css";

interface Props {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.number, Number(number)), eq(issues.status, "published")));
  if (!issue) return {};
  return {
    title: `Issue № ${issue.number} — ${issue.title} · The RenAIssance Fan`,
    description: issue.description ?? undefined,
  };
}

export default async function IssuePage({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.number, Number(number)), eq(issues.status, "published")));

  if (!issue) notFound();

  const [issuePosts, issueTools] = await Promise.all([
    getPostsByIssue(issue.id),
    db
      .select()
      .from(tools)
      .where(and(eq(tools.issueId, issue.id), eq(tools.status, "published")))
      .orderBy(asc(tools.sortOrder), asc(tools.createdAt)),
  ]);

  const lead: Post | null = issuePosts[0] ?? null;
  const sidebarPosts = issuePosts.slice(1, 4);
  const dispatchPosts =
    issuePosts.length > 4 ? issuePosts.slice(4, 7) : issuePosts.slice(1, 4);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        <SiteHeader
          activePath="/issues"
          stamp={`Vol. I · No. ${issue.number} · ${issue.title.toUpperCase()} · AD MMXXVI`}
        />

        {/* ════════ LEAD / HERO ════════ */}
        {lead && (
          <section className={styles.leadGrid} data-screen-label="Lead feature">
            <div className={styles.leadMain}>
              <span className={styles.kicker}>
                <span className={styles.kickerTag}>Lead Dispatch</span>
                <span className={styles.kickerCrumb}>
                  {`${firstTag(lead.tags) || "ESSAY"} № 01 — ${lead.title.toUpperCase().slice(0, 30)}`}
                </span>
              </span>

              <h2>
                <Link href={`/${lead.slug}`}>{lead.title}</Link>
              </h2>

              <p className={styles.leadDeck}>
                {lead.excerpt ?? ""}
              </p>

              {lead.figSvg && (
                <figure className={styles.plate}>
                  <div
                    className={styles.plateFrame}
                    dangerouslySetInnerHTML={{ __html: lead.figSvg }}
                  />
                  <figcaption>
                    <span className={styles.plateFig}>FIG. 1</span>
                  </figcaption>
                </figure>
              )}

              <div className={styles.leadByline}>
                <span className={styles.bylineWho}>By the Editor</span>
                <span className={styles.bylineFlesh}>Verified Flesh</span>
                <span className={styles.bylineDot} />
                <span>Assisted, suspiciously, by a machine</span>
                <span className={styles.bylineDot} />
                <span>{formatDate(lead.publishedAt)}</span>
                <span className={styles.bylineDot} />
                <span>{lead.readingTime} min read</span>
              </div>

              <Link className={styles.readOn} href={`/${lead.slug}`}>
                Read the dispatch <span className={styles.arrow}>→</span>
              </Link>
            </div>

            <aside className={styles.leadAside}>
              <div className={styles.miniSpec}>
                <div className={styles.miniSpecHead}>
                  <span className={styles.miniSpecTitle}>Spec Sheet</span>
                  <span className={styles.miniSpecFig}>FIG. 0 — PROVENANCE</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specKey}>Author</span>
                  <span className={styles.specVal}>
                    Human <span className={styles.red}>(mostly)</span>
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specKey}>Model</span>
                  <span className={styles.specVal}>Claude Sonnet 4.6</span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specKey}>Tokens</span>
                  <span className={styles.specVal}>
                    {lead.tokens ?? <span className={styles.muted}>—</span>}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specKey}>Sources</span>
                  <span className={styles.specVal}>
                    {(() => {
                      const n = refCount(lead.references);
                      return n > 0
                        ? <>{n} <span className={styles.red}>(all cited)</span></>
                        : <span className={styles.muted}>—</span>;
                    })()}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specKey}>Scale</span>
                  <span className={styles.specVal}>1:1, honest</span>
                </div>
              </div>

              {sidebarPosts.length > 0 && (
                <>
                  <div className={styles.asideLabel}>
                    <span className={styles.asideLabelText}>Also in this issue</span>
                    <span className={styles.asideLabelLine} />
                  </div>
                  {sidebarPosts.map((post, i) => (
                    <SidebarPost
                      key={post.id}
                      title={post.title}
                      slug={post.slug}
                      excerpt={post.excerpt ?? undefined}
                      readingTime={post.readingTime}
                      index={i}
                    />
                  ))}
                </>
              )}
            </aside>
          </section>
        )}

        {/* ════════ DISPATCHES ROW ════════ */}
        {dispatchPosts.length > 0 && (
          <section data-screen-label="Dispatches">
            <div className={styles.sectionHead}>
              <h3>Dispatches</h3>
              <span className={styles.sectionDesc}>
                essays, arguments, and the occasional confession
              </span>
              <span className={styles.sectionCount}>
                {padCount(issuePosts.length)} / ISSUE {padCount(issue.number)}
              </span>
            </div>
            <div className={styles.cards3}>
              {dispatchPosts.map((post) => (
                <DispatchCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ════════ TOOLS & CONTRAPTIONS ════════ */}
        {issueTools.length > 0 && (
          <section id="tools" data-screen-label="Tools">
            <div className={styles.sectionHead}>
              <h3>Tools &amp; Contraptions</h3>
              <span className={styles.sectionDesc}>
                small machines that make the big machine behave
              </span>
              <span className={styles.sectionCount}>
                {padCount(issueTools.length)} IN THE WORKSHOP
              </span>
            </div>
            <div className={styles.tools}>
              {issueTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* ════════ SIGN UP ════════ */}
        <section className={styles.signup} data-screen-label="Subscribe">
          <div className={styles.signupEye}>The Standing Invitation</div>
          <SubscribeForm
            formClass={styles.signupForm}
            inputClass={styles.signupInput}
            buttonClass={styles.signupButton}
          />
          <div className={styles.signupFine}>
            No tracking pixels. No model trained on your inbox. Just letters.
          </div>
        </section>

        <SiteFooter />

      </div>
    </div>
  );
}
