import { RenaiLogo } from "@/components/RenaiLogo";
import { db } from "@/db";
import { issues, posts, resources } from "@/db/schema";
import type { Post } from "@/db/schema";
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

export default async function IssuePage({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.number, Number(number)), eq(issues.status, "published")));

  if (!issue) notFound();

  const [issuePosts, issueResources] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(and(eq(posts.issueId, issue.id), eq(posts.status, "published")))
      .orderBy(desc(posts.publishedAt)),
    db
      .select()
      .from(resources)
      .where(eq(resources.issueId, issue.id))
      .orderBy(asc(resources.createdAt)),
  ]);

  const lead: Post | null = issuePosts[0] ?? null;
  const sidebarPosts = issuePosts.slice(1, 4);
  const dispatchPosts =
    issuePosts.length > 4 ? issuePosts.slice(4, 7) : issuePosts.slice(1, 4);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        {/* ════════ MASTHEAD ════════ */}
        <header>
          <div className={styles.topbar}>
            <div className={styles.topbarLine} />
            <div className={styles.topbarStamp}>
              Vol. I · No. {issue.number} · {issue.title.toUpperCase()} · AD MMXXVI
            </div>
            <div className={styles.topbarLine} />
          </div>
          <div className={styles.ruleThick} />
          <div style={{ height: 2 }} />
          <div className={styles.ruleThin} />

          <div className={styles.masthead}>
            <Link className={styles.brand} href="/" aria-label="The RenAIssance Fan — home">
              <RenaiLogo className={styles.brandLogo} />
              <span className={styles.brandDivider} />
            </Link>
            <div className={styles.mastheadTitle}>
              The Ren<span className={styles.titleAI}>AI</span>ssance Fan
              <span className={styles.titleSub}>
                Fallibly Human &amp; Artificially Divine
              </span>
            </div>
          </div>

          <div className={styles.ruleThin} />
          <div style={{ height: 2 }} />
          <div className={styles.ruleThick} />

          <nav className={styles.nav}>
            <Link href="/">Dispatches</Link>
            <Link href="/issues" className={styles.navActive}>The Archive</Link>
            <Link href="/about">About the Fan</Link>
          </nav>
        </header>

        {/* ════════ ISSUE HEADER ════════ */}
        <div className={styles.issueHeader}>
          <div className={styles.issueNum}>Issue № {padCount(issue.number)}</div>
          <h2 className={styles.issueTitle}>{issue.title}</h2>
          {issue.description && (
            <p className={styles.issueDesc}>{issue.description}</p>
          )}
          <div className={styles.issueMeta}>
            {issue.publishedAt ? formatDate(new Date(issue.publishedAt)) : ""}
            {" · "}
            {padCount(issuePosts.length)} dispatches
          </div>
        </div>

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

            {sidebarPosts.length > 0 && (
              <aside className={styles.leadAside}>
                <div className={styles.asideLabel}>
                  <span className={styles.asideLabelText}>Also in this issue</span>
                  <span className={styles.asideLabelLine} />
                </div>
                {sidebarPosts.map((post, i) => (
                  <SidebarPost key={post.id} post={post} index={i} />
                ))}
              </aside>
            )}
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

        {/* ════════ RESOURCES ════════ */}
        {issueResources.length > 0 && (
          <section data-screen-label="Resources">
            <div className={styles.sectionHead}>
              <h3>Further Reading</h3>
              <span className={styles.sectionDesc}>
                links, books, and tools curated for this issue
              </span>
              <span className={styles.sectionCount}>
                {padCount(issueResources.length)} ITEMS
              </span>
            </div>
            <div className={styles.tools}>
              {issueResources.map((resource) => (
                <div key={resource.id} className={styles.tool}>
                  <div className={styles.toolHead}>
                    <span className={styles.toolTitle}>{resource.title}</span>
                    <span className={styles.toolVersion}>{resource.type}</span>
                  </div>
                  <div className={styles.toolBody}>
                    <h4>{resource.title}</h4>
                    {resource.description && <p>{resource.description}</p>}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.toolCta}
                      >
                        Open <span className={styles.arrow}>→</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════════ FOOTER ════════ */}
        <footer className={styles.colophon} data-screen-label="Footer">
          <div className={styles.colophonTop}>
            <div className={styles.colophonLhs}>
              <RenaiLogo className={styles.footerLogo} />
              <span className={styles.colophonTagline}>
                Fallibly human, artificially divine.
              </span>
            </div>
            <div className={styles.colophonCols}>
              <div className={styles.colophonCol}>
                <h5>The Paper</h5>
                <Link href="/">Current Issue</Link>
                <Link href="/issues">The Archive</Link>
              </div>
              <div className={styles.colophonCol}>
                <h5>The Fan</h5>
                <Link href="/about">About</Link>
              </div>
            </div>
          </div>
          <div className={styles.colophonMeta}>
            THE REN<span className={styles.red}>AI</span>SSANCE FAN · VOL. I · ISSUE №{" "}
            {padCount(issue.number)} · AD MMXXVI
            <br />
            Every issue carries its provenance in ink. The machine helps; the human signs.{" "}
            <span className={styles.red}>Sources kept, always.</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
