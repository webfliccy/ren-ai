import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SubscribeForm from "@/components/SubscribeForm";
import { ToolCard } from "@/components/ToolCard";
import { SidebarPost } from "@/components/SidebarPost";
import { SidebarFieldNote } from "@/components/SidebarFieldNote";
import { DispatchCard } from "@/components/DispatchCard";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { db } from "@/db";
import { issues, posts, tools, fieldNotes } from "@/db/schema";
import type { Issue, Post, Tool } from "@/db/schema";
import { formatDate, padCount } from "@/lib/formatters";
import { firstTag } from "@/lib/tags";
import { refCount } from "@/lib/references";
import { PLACEHOLDER_SIDEBAR, PLACEHOLDER_DISPATCHES, PLACEHOLDER_TOOLS } from "@/app/_placeholder";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import styles from "./homepage.module.css";

export const metadata = {
  title: "The RenAIssance Fan — Adventures in Artificial Intelligence",
  description:
    "Fallibly human dispatches from the edge of artificial intelligence. Essays, tools, and an honest ledger.",
};

export default async function Home() {
  const [currentIssue]: (Issue | undefined)[] = await db
    .select()
    .from(issues)
    .where(eq(issues.status, "published"))
    .orderBy(desc(issues.number))
    .limit(1);

  const [allPosts, issueTools, latestNotes] = await Promise.all([
    currentIssue
      ? db
          .select()
          .from(posts)
          .where(and(eq(posts.issueId, currentIssue.id), eq(posts.status, "published")))
          .orderBy(desc(sql`${posts.featured}`), desc(posts.publishedAt))
      : db
          .select()
          .from(posts)
          .where(eq(posts.status, "published"))
          .orderBy(desc(sql`${posts.featured}`), desc(posts.publishedAt))
          .limit(7),
    currentIssue
      ? db
          .select()
          .from(tools)
          .where(and(eq(tools.issueId, currentIssue.id), eq(tools.status, "published")))
          .orderBy(asc(tools.sortOrder), asc(tools.createdAt))
      : Promise.resolve([] as Tool[]),
    currentIssue
      ? db
          .select()
          .from(fieldNotes)
          .where(and(eq(fieldNotes.issueId, currentIssue.id), eq(fieldNotes.status, "published")))
          .orderBy(desc(fieldNotes.publishedAt))
      : db
          .select()
          .from(fieldNotes)
          .where(eq(fieldNotes.status, "published"))
          .orderBy(desc(fieldNotes.publishedAt))
          .limit(3),
  ]);

  const lead: Post | null = allPosts[0] ?? null;
  const sidebarPosts = allPosts.slice(1, 4);
  const dispatchPosts =
    allPosts.length > 4 ? allPosts.slice(4, 7) : allPosts.slice(1, 4);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        <SiteHeader activePath="/" />

        {/* ════════ LEAD / HERO ════════ */}
        <section className={styles.leadGrid} data-screen-label="Lead feature">
          <div className={styles.leadMain}>
            <span className={styles.kicker}>
              <span className={styles.kickerTag}>
                {lead?.featured ? "Feature Story" : "Lead Dispatch"}
              </span>
              <span className={styles.kickerCrumb}>
                {lead
                  ? `${firstTag(lead.tags) || "ESSAY"} № 01 — ${lead.title.toUpperCase().slice(0, 30)}`
                  : "ESSAY № 01 — ON CREDIT & THEFT"}
              </span>
            </span>

            {lead ? (
              <h2>
                <Link href={`/${lead.slug}`}>{lead.title}</Link>
              </h2>
            ) : (
              <h2>On the Shoulders of Scraped Giants</h2>
            )}

            <p className={styles.leadDeck}>
              {lead?.excerpt ??
                "In defence of the footnote — a small, stubborn act of remembering who said it first, written with the help of a machine that, left alone, would remember no one at all."}
            </p>

            {lead?.figSvg && (
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
              <span>{lead ? formatDate(lead.publishedAt) : "19 June 2026"}</span>
              <span className={styles.bylineDot} />
              <span>{lead ? `${lead.readingTime} min read` : "11 min read"}</span>
            </div>

            {lead && (
              <Link className={styles.readOn} href={`/${lead.slug}`}>
                Read the dispatch <span className={styles.arrow}>→</span>
              </Link>
            )}
          </div>

          {/* ── ASIDE ── */}
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
                  {lead?.tokens ?? <span className={styles.muted}>—</span>}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Sources</span>
                <span className={styles.specVal}>
                  {lead
                    ? (() => {
                        const n = refCount(lead.references);
                        return n > 0
                          ? <>{n} <span className={styles.red}>(all cited)</span></>
                          : <span className={styles.muted}>—</span>;
                      })()
                    : <span className={styles.muted}>—</span>}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Scale</span>
                <span className={styles.specVal}>1:1, honest</span>
              </div>
            </div>

            <div className={styles.asideLabel}>
              <span className={styles.asideLabelText}>Also in this issue</span>
              <span className={styles.asideLabelLine} />
            </div>

            {sidebarPosts.length > 0
              ? sidebarPosts.map((post, i) => (
                  <SidebarPost key={post.id} post={post} index={i} />
                ))
              : PLACEHOLDER_SIDEBAR.map((item) => (
                  <div key={item.num} className={styles.stackItem}>
                    <span className={styles.stackNum}>{item.num}</span>
                    <h4>
                      <a href="#">{item.title}</a>
                    </h4>
                    <p>{item.excerpt}</p>
                    <div className={styles.stackMeta}>{item.meta}</div>
                  </div>
                ))}
            {latestNotes.map((note, i) => (
              <SidebarFieldNote
                key={note.id}
                note={note}
                num={padCount(sidebarPosts.length + i + 2)}
              />
            ))}
          </aside>
        </section>

        {/* ════════ DISPATCHES & FIELD NOTES ROW ════════ */}
        <section data-screen-label="Dispatches & Field Notes">
          <div className={styles.sectionHead}>
            <h3>Dispatches &amp; Field Notes</h3>
            <span className={styles.sectionDesc}>
              essays, arguments, and experiment logs
            </span>
            <span className={styles.sectionCount}>
              {padCount(allPosts.length)} / SEASON I
            </span>
          </div>
          <div className={styles.cards3}>
            {dispatchPosts.length > 0
              ? dispatchPosts.map((post) => (
                  <DispatchCard key={post.id} post={post} />
                ))
              : PLACEHOLDER_DISPATCHES.map((item) => (
                  <article key={item.tag} className={styles.dispatch}>
                    <div className={styles.dispatchTag}>{item.tag}</div>
                    <h4>
                      <a href="#">{item.title}</a>
                    </h4>
                    <p>{item.excerpt}</p>
                    <div className={styles.dispatchFoot}>
                      <span>{item.min} MIN READ</span>
                      <span className={styles.red}>COMING SOON</span>
                    </div>
                  </article>
                ))}
            {latestNotes.map((note) => (
              <FieldNoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>

        {/* ════════ TOOLS & CONTRAPTIONS ════════ */}
        <section id="tools" data-screen-label="Tools">
          <div className={styles.sectionHead}>
            <h3>Tools &amp; Contraptions</h3>
            <span className={styles.sectionDesc}>
              small machines that make the big machine behave
            </span>
            <span className={styles.sectionCount}>
              {issueTools.length > 0
                ? `${padCount(issueTools.length)} IN THE WORKSHOP`
                : "03 IN THE WORKSHOP"}
            </span>
          </div>
          <div className={styles.tools}>
            {issueTools.length > 0
              ? issueTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
              : PLACEHOLDER_TOOLS.map((p) => (
                  <a key={p.title} className={styles.tool} href="#">
                    <div className={styles.toolHead}>
                      <span className={styles.toolTitle}>{p.title}</span>
                      <span className={styles.toolVersion}>{p.version}</span>
                    </div>
                    <div
                      className={styles.toolSvg}
                      dangerouslySetInnerHTML={{ __html: p.svgContent }}
                    />
                    <div className={styles.toolBody}>
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                      <span className={styles.toolCta}>
                        Open the tool <span className={styles.arrow}>→</span>
                      </span>
                    </div>
                  </a>
                ))}
          </div>
        </section>

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
