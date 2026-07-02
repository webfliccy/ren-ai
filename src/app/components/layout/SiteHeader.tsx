import { db } from "@/db";
import { issues } from "@/db/schema";
import { RenaiLogo } from "@/components/RenaiLogo";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { NavLinks } from "./NavLinks";
import styles from "./SiteHeader.module.css";

function formatStamp(issue: { number: number; title: string }): string {
  return `Vol. I · No. ${issue.number} · ${issue.title.toUpperCase()} · AD MMXXVI`;
}

async function getTopbarStamp(): Promise<string> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const issueNumberMatch = pathname.match(/^\/issues\/(\d+)$/);

  if (issueNumberMatch) {
    const [issue] = await db
      .select({ number: issues.number, title: issues.title })
      .from(issues)
      .where(eq(issues.number, Number(issueNumberMatch[1])));
    if (issue) return formatStamp(issue);
  }

  const [current] = await db
    .select({ number: issues.number, title: issues.title })
    .from(issues)
    .where(eq(issues.status, "published"))
    .orderBy(desc(issues.number))
    .limit(1);

  return current
    ? formatStamp(current)
    : "Vol. I · Est. by a Fool with Wi-Fi · AD MMXXVI";
}

export default async function SiteHeader() {
  const topbarStamp = await getTopbarStamp();

  return (
    <header>
      <div className={styles.topbar}>
        <div className={styles.topbarLine} />
        <div className={styles.topbarStamp}>{topbarStamp}</div>
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
        <Link href="/" className={styles.mastheadTitle}>
          The Ren<span className={styles.titleAI}>AI</span>ssance Fan
          <span className={styles.titleSub}>
            Fallibly Human, Artificially Divine
          </span>
        </Link>
      </div>

      <div className={styles.ruleThin} />
      <div style={{ height: 2 }} />
      <div className={styles.ruleThick} />

      <NavLinks />
    </header>
  );
}
