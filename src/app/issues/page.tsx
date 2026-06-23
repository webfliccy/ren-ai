import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/db";
import { issues, posts } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import Link from "next/link";
import styles from "../[slug]/article.module.css";

export const metadata = {
  title: "The Archive — The RenAIssance Fan",
  description: "Every past issue of The RenAIssance Fan, in order.",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ArchivePage() {
  const [current] = await db
    .select()
    .from(issues)
    .where(eq(issues.status, "published"))
    .orderBy(desc(issues.number))
    .limit(1);

  const pastIssues = current
    ? await db
        .select()
        .from(issues)
        .where(and(eq(issues.status, "published"), lt(issues.number, current.number)))
        .orderBy(desc(issues.number))
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        <SiteHeader activePath="/issues" />

        <div style={{ height: 4 }} />
        <div className={styles.ruleThin} />

        <article className={styles.article}>
          <div className={styles.kicker}>
            <span className={styles.kickerTag}>Archive</span>
            <span className={styles.kickerCrumb}>EVERY PAST ISSUE, IN ORDER</span>
          </div>

          <h1 className={styles.headline}>The Archive</h1>

          {current && (
            <p className={styles.deck}>
              The current issue is{" "}
              <Link href="/">№ {current.number} — {current.title}</Link>.
              Past issues are below.
            </p>
          )}

          {pastIssues.length === 0 ? (
            <div className={styles.prose}>
              <p>No past issues yet. The archive fills as new issues are published.</p>
            </div>
          ) : (
            <div style={{ marginTop: 40 }}>
              {pastIssues.map((issue, i) => (
                <div key={issue.id}>
                  {i > 0 && (
                    <div style={{ height: 1, background: "var(--border)", margin: "32px 0" }} />
                  )}
                  <Link
                    href={`/issues/${issue.number}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-courier-prime), monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: "var(--red)",
                          textTransform: "uppercase",
                        }}
                      >
                        № {String(issue.number).padStart(2, "0")}
                      </span>
                      <h2
                        style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: 32,
                          fontWeight: 600,
                          lineHeight: 1.1,
                          color: "var(--ink)",
                          margin: 0,
                        }}
                      >
                        {issue.title}
                      </h2>
                    </div>
                    {issue.description && (
                      <p
                        style={{
                          fontFamily: "var(--font-newsreader), Georgia, serif",
                          fontSize: 17,
                          fontStyle: "italic",
                          color: "var(--ink-light)",
                          margin: "0 0 10px",
                          lineHeight: 1.5,
                        }}
                      >
                        {issue.description}
                      </p>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-courier-prime), monospace",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {issue.publishedAt ? formatDate(new Date(issue.publishedAt)) : ""}
                      {" · Read the issue →"}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>

        <SiteFooter />

      </div>
    </div>
  );
}
