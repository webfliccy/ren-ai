import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/db";
import { sitePages } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import styles from "../[slug]/article.module.css";

export const metadata = {
  title: "About the Fan — The RenAIssance Fan",
  description: "About the editor behind The RenAIssance Fan.",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AboutPage() {
  const [page] = await db.select().from(sitePages).where(eq(sitePages.key, "about"));

  const title = page?.title || "About the Fan";
  const content = page?.content ?? "";
  const updatedDate = page?.updatedAt ? formatDate(new Date(page.updatedAt)) : null;

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        <SiteHeader activePath="/about" />

        <div style={{ height: 4 }} />
        <div className={styles.ruleThin} />

        <article className={styles.article}>
          <div className={styles.kicker}>
            <span className={styles.kickerTag}>About</span>
            <span className={styles.kickerCrumb}>THE FAN — WHO IS BEHIND THIS</span>
          </div>

          <h1 className={styles.headline}>{title}</h1>

          {content ? (
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className={styles.prose}>
              <p>
                This page is yet to be written. The editor is presumably composing themselves.
              </p>
            </div>
          )}

          <section className={styles.spec} aria-label="Page provenance">
            <div className={styles.specHead}>
              <span className={styles.specHeadTitle}>
                Production Record — Specification Sheet
              </span>
              <span className={styles.specHeadFig}>FIG. 1-A</span>
            </div>

            <div className={styles.specRows}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Author</span>
                <span className={styles.specVal}>The Editor, human</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Assisted by</span>
                <span className={styles.specVal}>Claude Sonnet 4.6</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Model ver.</span>
                <span className={`${styles.specVal} ${styles.red}`}>
                  claude-sonnet-4-6
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Tokens</span>
                <span className={`${styles.specVal} ${page?.tokens ? "" : styles.muted}`}>
                  {page?.tokens ?? "—"}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Last revised</span>
                <span className={`${styles.specVal} ${updatedDate ? "" : styles.muted}`}>
                  {updatedDate ?? "—"}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Purpose</span>
                <span className={styles.specVal}>Self-portrait, in ink</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Revision</span>
                <span className={styles.specVal}>Ongoing</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Scale</span>
                <span className={styles.specVal}>1:1, honest</span>
              </div>
              {page?.prompt && (
                <div className={`${styles.specRow} ${styles.specRowFull}`}>
                  <span className={styles.specKey}>Prompt</span>
                  <span className={styles.specVal}>{page.prompt}</span>
                </div>
              )}
            </div>

            <div className={styles.specFoot}>
              <span className={styles.specFootSig}>The Editor</span>
              <span className={styles.muted}>&nbsp;—&nbsp;</span>
              <span>Countersigned in ink, by a hand that can be sued.</span>
            </div>
          </section>

        </article>

        <SiteFooter />

      </div>
    </div>
  );
}
