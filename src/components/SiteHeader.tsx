import { db } from "@/db";
import { issues } from "@/db/schema";
import { RenaiLogo } from "@/components/RenaiLogo";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const NAV = [
  { label: "Dispatches & Field Notes", href: "/field-notes" },
  { label: "Tools & Contraptions", href: "/tools" },
  { label: "The Archive", href: "/issues" },
  { label: "About the Fan", href: "/about" },
] as const;

interface Props {
  activePath?: string;
  stamp?: string;
}

export default async function SiteHeader({ activePath, stamp }: Props) {
  let topbarStamp = stamp;
  if (!topbarStamp) {
    const [current] = await db
      .select({ number: issues.number, title: issues.title })
      .from(issues)
      .where(eq(issues.status, "published"))
      .orderBy(desc(issues.number))
      .limit(1);
    topbarStamp = current
      ? `Vol. I · No. ${current.number} · ${current.title.toUpperCase()} · AD MMXXVI`
      : "Vol. I · Est. by a Fool with Wi-Fi · AD MMXXVI";
  }

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

      <nav className={styles.nav}>
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={activePath === href ? styles.navActive : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
