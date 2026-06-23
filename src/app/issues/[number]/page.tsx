import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SubscribeForm from "@/components/SubscribeForm";
import { db } from "@/db";
import { issues, posts, tools } from "@/db/schema";
import type { Post, Tool } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../homepage.module.css";

interface Props {
  params: Promise<{ number: string }>;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function firstTag(tagsJson: string): string {
  try {
    const tags = JSON.parse(tagsJson);
    return Array.isArray(tags) && tags[0] ? String(tags[0]) : "";
  } catch {
    return "";
  }
}

function padCount(n: number): string {
  return String(n).padStart(2, "0");
}

function refCount(refsJson: string): number {
  try {
    const arr = JSON.parse(refsJson);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
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

function SidebarPost({ post, index }: { post: Post; index: number }) {
  return (
    <div className={styles.stackItem}>
      <span className={styles.stackNum}>{padCount(index + 2)}</span>
      <h4>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className={styles.stackMeta}>DISPATCH · {post.readingTime} MIN</div>
    </div>
  );
}

function DispatchCard({ post }: { post: Post }) {
  return (
    <article className={styles.dispatch}>
      <div className={styles.dispatchTag}>{firstTag(post.tags) || "Dispatch"}</div>
      <h4>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className={styles.dispatchFoot}>
        <span>{post.readingTime} MIN READ</span>
        <span className={styles.red}>{formatDate(post.publishedAt)}</span>
      </div>
    </article>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      {tool.category && (
        <div className={styles.toolHead}>
          <span className={styles.toolVersion}>{tool.category}</span>
        </div>
      )}
      {tool.illustration && (
        <div
          className={styles.toolSvg}
          dangerouslySetInnerHTML={{ __html: tool.illustration }}
        />
      )}
      <div className={styles.toolBody}>
        <h4>{tool.name}</h4>
        {tool.descriptor && <p>{tool.descriptor}</p>}
        <span className={styles.toolCta}>
          Open the tool <span className={styles.arrow}>→</span>
        </span>
      </div>
    </>
  );

  return tool.url ? (
    <a className={styles.tool} href={tool.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <div className={styles.tool}>{inner}</div>
  );
}

export default async function IssuePage({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.number, Number(number)), eq(issues.status, "published")));

  if (!issue) notFound();

  const [issuePosts, issueTools] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(and(eq(posts.issueId, issue.id), eq(posts.status, "published")))
      .orderBy(desc(posts.publishedAt)),
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
                    <SidebarPost key={post.id} post={post} index={i} />
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
