import SubscribeForm from "@/components/SubscribeForm";
import { RenaiLogo } from "@/components/RenaiLogo";
import { db } from "@/db";
import { issues, posts, tools } from "@/db/schema";
import type { Issue, Post, Tool } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import styles from "./homepage.module.css";

export const metadata = {
  title: "The RenAIssance Fan — Adventures in Artificial Intelligence",
  description:
    "Fallibly human dispatches from the edge of artificial intelligence. Essays, tools, and an honest ledger.",
};

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

// ── Components ───────────────────────────────────────────────────────────────

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

// ── Static placeholder content shown when the DB is empty ───────────────────

const PLACEHOLDER_SIDEBAR = [
  {
    num: "02",
    title: "The Hallucination Will Be Cited",
    excerpt:
      "A field guide to the model's most confident lie: the source that sounds perfect and does not exist.",
    meta: "DISPATCH · 7 MIN",
  },
  {
    num: "03",
    title: "Prompt & Circumstance",
    excerpt:
      "We published every prompt behind this issue. Read them and judge how much was really ours.",
    meta: "DISPATCH · 5 MIN",
  },
  {
    num: "04",
    title: "A Brief History of Confidently Wrong",
    excerpt:
      "From the Delphic oracle to the autocomplete bar — humanity's long romance with the assured guess.",
    meta: "DISPATCH · 9 MIN",
  },
];

const PLACEHOLDER_DISPATCHES = [
  {
    tag: "On Method",
    title: "How to Read a Machine That Cannot Read You Back",
    excerpt:
      "A working etiquette for collaborating with something that has opinions but no memory, no stake, and no shame.",
    min: 6,
  },
  {
    tag: "On Taste",
    title: "The Median Is Not Your Friend",
    excerpt:
      "Why a model trained on everyone's writing will, by design, hand you the most forgettable sentence available.",
    min: 8,
  },
  {
    tag: "On Labour",
    title: "Who Does the Dishes After the Renaissance?",
    excerpt:
      "The miracle does the fun part. Someone still has to check, credit, and sign. A note on the unglamorous remainder.",
    min: 7,
  },
];

// ── Page components ──────────────────────────────────────────────────────────

function SidebarPost({ post, index }: { post: Post; index: number }) {
  return (
    <div className={styles.stackItem}>
      <span className={styles.stackNum}>{padCount(index + 2)}</span>
      <h4>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h4>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className={styles.stackMeta}>
        DISPATCH · {post.readingTime} MIN
      </div>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [currentIssue]: (Issue | undefined)[] = await db
    .select()
    .from(issues)
    .where(eq(issues.status, "published"))
    .orderBy(desc(issues.number))
    .limit(1);

  const [allPosts, issueTools] = await Promise.all([
    currentIssue
      ? db
          .select()
          .from(posts)
          .where(and(eq(posts.issueId, currentIssue.id), eq(posts.status, "published")))
          .orderBy(desc(posts.publishedAt))
      : db
          .select()
          .from(posts)
          .where(eq(posts.status, "published"))
          .orderBy(desc(posts.publishedAt))
          .limit(7),
    currentIssue
      ? db
          .select()
          .from(tools)
          .where(and(eq(tools.issueId, currentIssue.id), eq(tools.status, "published")))
          .orderBy(asc(tools.sortOrder), asc(tools.createdAt))
      : Promise.resolve([] as Tool[]),
  ]);

  const lead: Post | null = allPosts[0] ?? null;
  const sidebarPosts = allPosts.slice(1, 4);
  const dispatchPosts =
    allPosts.length > 4 ? allPosts.slice(4, 7) : allPosts.slice(1, 4);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        {/* ════════ MASTHEAD ════════ */}
        <header>
          <div className={styles.topbar}>
            <div className={styles.topbarLine} />
            <div className={styles.topbarStamp}>
              Vol. I · No. {currentIssue?.number ?? "—"}{currentIssue?.title ? ` · ${currentIssue.title.toUpperCase()}` : " · Est. by a Fool with Wi-Fi"} · AD MMXXVI
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
            <a href="/" className={styles.navActive}>Dispatches</a>
            <a href="#tools">Tools &amp; Contraptions</a>
            <a href="/issues">The Archive</a>
            <a href="/about">About the Fan</a>
          </nav>
        </header>

        {/* ════════ LEAD / HERO ════════ */}
        <section className={styles.leadGrid} data-screen-label="Lead feature">
          <div className={styles.leadMain}>
            <span className={styles.kicker}>
              <span className={styles.kickerTag}>Lead Dispatch</span>
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
          </aside>
        </section>

        {/* ════════ DISPATCHES ROW ════════ */}
        <section data-screen-label="Dispatches">
          <div className={styles.sectionHead}>
            <h3>Dispatches</h3>
            <span className={styles.sectionDesc}>
              essays, arguments, and the occasional confession
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
            {issueTools.length > 0 ? (
              issueTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
            ) : (
              <>
                <a className={styles.tool} href="#">
                  <div className={styles.toolHead}>
                    <span className={styles.toolTitle}>The Provenance Stamp</span>
                    <span className={styles.toolVersion}>v0.3</span>
                  </div>
                  <div className={styles.toolSvg}>
                    <svg width="150" height="110" viewBox="0 0 150 110" fill="none">
                      <rect x="22" y="18" width="106" height="74" rx="3" fill="#FAF6EE" stroke="#3A2E1C" strokeWidth="1.1"/>
                      <line x1="22" y1="34" x2="128" y2="34" stroke="#3A2E1C" strokeWidth="0.8"/>
                      <text x="30" y="30" fontFamily="'Courier Prime', monospace" fontSize="6.5" fill="#3A2E1C" opacity="0.7">PROVENANCE</text>
                      <g fontFamily="'Courier Prime', monospace" fontSize="6" fill="#3A2E1C" opacity="0.55">
                        <text x="30" y="48">AUTHOR ........</text>
                        <text x="30" y="60">MODEL .........</text>
                        <text x="30" y="72">TOKENS ........</text>
                        <text x="30" y="84">PROMPT ........</text>
                      </g>
                      <circle cx="108" cy="74" r="15" fill="none" stroke="#ED1C2E" strokeWidth="1.4"/>
                      <circle cx="108" cy="74" r="11" fill="none" stroke="#ED1C2E" strokeWidth="0.6" strokeDasharray="2 2"/>
                      <text x="108" y="77" fontFamily="'Cormorant Garamond', serif" fontSize="9" fontStyle="italic" fontWeight="600" fill="#ED1C2E" textAnchor="middle">RenAI</text>
                    </svg>
                  </div>
                  <div className={styles.toolBody}>
                    <h4>The Provenance Stamp</h4>
                    <p>
                      Paste anything a model helped you make. It returns the spec
                      sheet — author, version, tokens, prompt — ready to print in
                      ink.
                    </p>
                    <span className={styles.toolCta}>
                      Open the tool <span className={styles.arrow}>→</span>
                    </span>
                  </div>
                </a>

                <a className={styles.tool} href="#">
                  <div className={styles.toolHead}>
                    <span className={styles.toolTitle}>Footnote Forge</span>
                    <span className={styles.toolVersion}>v0.2</span>
                  </div>
                  <div className={styles.toolSvg}>
                    <svg width="150" height="110" viewBox="0 0 150 110" fill="none">
                      <path d="M40 24 H110 M40 38 H110 M40 52 H92" stroke="#3A2E1C" strokeWidth="1.4" strokeLinecap="round"/>
                      <text x="40" y="80" fontFamily="'Courier Prime', monospace" fontSize="8" fill="#ED1C2E">[1]</text>
                      <text x="62" y="80" fontFamily="'Courier Prime', monospace" fontSize="8" fill="#ED1C2E">[2]</text>
                      <text x="84" y="80" fontFamily="'Courier Prime', monospace" fontSize="8" fill="#ED1C2E">[3]</text>
                      <line x1="40" y1="88" x2="110" y2="88" stroke="#3A2E1C" strokeWidth="0.6"/>
                      <text x="40" y="100" fontFamily="'Courier Prime', monospace" fontSize="5.5" fill="#3A2E1C" opacity="0.55">claims → checkable sources</text>
                    </svg>
                  </div>
                  <div className={styles.toolBody}>
                    <h4>Footnote Forge</h4>
                    <p>
                      Feed it a confident paragraph. It hunts down a real citation
                      for every claim — and flags the ones it can&apos;t, instead of
                      inventing them.
                    </p>
                    <span className={styles.toolCta}>
                      Open the tool <span className={styles.arrow}>→</span>
                    </span>
                  </div>
                </a>

                <a className={styles.tool} href="#">
                  <div className={styles.toolHead}>
                    <span className={styles.toolTitle}>The Bluff Detector</span>
                    <span className={styles.toolVersion}>v0.1</span>
                  </div>
                  <div className={styles.toolSvg}>
                    <svg width="150" height="110" viewBox="0 0 150 110" fill="none">
                      <circle cx="62" cy="55" r="30" fill="none" stroke="#3A2E1C" strokeWidth="1.2"/>
                      <line x1="84" y1="77" x2="104" y2="97" stroke="#3A2E1C" strokeWidth="2.4" strokeLinecap="round"/>
                      <circle cx="62" cy="55" r="3" fill="#ED1C2E"/>
                      <path d="M48 55 Q62 42 76 55" stroke="#ED1C2E" strokeWidth="1.2" fill="none" strokeDasharray="2 2"/>
                      <text x="62" y="92" fontFamily="'Courier Prime', monospace" fontSize="6" fill="#ED1C2E" textAnchor="middle">SOURCE NOT FOUND</text>
                    </svg>
                  </div>
                  <div className={styles.toolBody}>
                    <h4>The Bluff Detector</h4>
                    <p>
                      Reads a model&apos;s answer and underlines every spot where it
                      sounds certain but has nothing underneath. A confidence X-ray.
                    </p>
                    <span className={styles.toolCta}>
                      Open the tool <span className={styles.arrow}>→</span>
                    </span>
                  </div>
                </a>
              </>
            )}
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
                <a href="/">Dispatches</a>
                <a href="#tools">Tools &amp; Contraptions</a>
                <a href="/issues">The Archive</a>
              </div>
              <div className={styles.colophonCol}>
                <h5>The Fan</h5>
                <a href="/about">About</a>
                <a href="#">Colophon</a>
                <a href="#">How this is made</a>
                <a href="#">Corrections</a>
              </div>
              <div className={styles.colophonCol}>
                <h5>Elsewhere</h5>
                <a href="/feed.xml">RSS, the honest feed</a>
                <a href="#">Email the Editor</a>
                <a href="#">Source &amp; licence</a>
              </div>
            </div>
          </div>
          <div className={styles.colophonMeta}>
            THE REN<span className={styles.red}>AI</span>SSANCE FAN · VOL. I · AD
            MMXXVI · Set in Cormorant, Newsreader &amp; Courier Prime
            <br />
            Every issue carries its provenance in ink. The machine helps; the human
            signs.{" "}
            <span className={styles.red}>Sources kept, always.</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
