import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/db";
import { issues } from "@/db/schema";
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
            <div className={styles.archiveList}>
              {pastIssues.map((issue, i) => (
                <div key={issue.id}>
                  {i > 0 && <div className={styles.archiveDivider} />}
                  <Link href={`/issues/${issue.number}`} className={styles.archiveLink}>
                    <div className={styles.archiveItemHead}>
                      <span className={styles.archiveNum}>
                        № {String(issue.number).padStart(2, "0")}
                      </span>
                      <h2 className={styles.archiveTitle}>{issue.title}</h2>
                    </div>
                    {issue.description && (
                      <p className={styles.archiveDesc}>{issue.description}</p>
                    )}
                    <span className={styles.archiveMeta}>
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
