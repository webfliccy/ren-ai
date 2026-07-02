import { RenaiLogo } from "@/components/RenaiLogo";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
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
            <Link href="/dispatches">Dispatches</Link>
            <Link href="/tools">Tools &amp; Contraptions</Link>
            <Link href="/issues">The Archive</Link>
          </div>
          <div className={styles.colophonCol}>
            <h5>The Fan</h5>
            <Link href="/about">About</Link>
          </div>
          <div className={styles.colophonCol}>
            <h5>Elsewhere</h5>
            <Link href="/feed.xml">RSS, the honest feed</Link>
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
  );
}
