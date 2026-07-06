import { RenaiLogo } from "@/components/RenaiLogo";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className="mt-16 border-t-[3px] border-ink pt-4 pb-11"
      data-screen-label="Footer"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <RenaiLogo className="block h-[34px] w-auto" />
          <span className="font-cormorant text-lg text-ink-light italic">
            Fallibly human, artificially divine.
          </span>
        </div>
        <div className="flex flex-wrap gap-12">
          <div>
            <h5 className="mb-2.5 text-[9px] font-bold tracking-3 text-muted uppercase">
              The Paper
            </h5>
            <Link
              className="mb-1.5 block text-[12.5px] text-ink-light no-underline hover:text-accent"
              href="/dispatches"
            >
              Dispatches
            </Link>
            <Link
              className="mb-1.5 block text-[12.5px] text-ink-light no-underline hover:text-accent"
              href="/tools"
            >
              Tools &amp; Contraptions
            </Link>
            <Link
              className="mb-1.5 block text-[12.5px] text-ink-light no-underline hover:text-accent"
              href="/issues"
            >
              The Archive
            </Link>
          </div>
          <div>
            <h5 className="mb-2.5 text-[9px] font-bold tracking-3 text-muted uppercase">
              The Fan
            </h5>
            <Link
              className="mb-1.5 block text-[12.5px] text-ink-light no-underline hover:text-accent"
              href="/about"
            >
              About
            </Link>
          </div>
          <div>
            <h5 className="mb-2.5 text-[9px] font-bold tracking-3 text-muted uppercase">
              Elsewhere
            </h5>
            <Link
              className="mb-1.5 block text-[12.5px] text-ink-light no-underline hover:text-accent"
              href="/feed.xml"
            >
              RSS, the honest feed
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-7 border-t border-rule pt-3.5 font-courier text-[9.5px] leading-[1.7] tracking-[0.06em] text-muted">
        THE REN<span className="text-accent">AI</span>SSANCE FAN · VOL. I · AD
        MMXXVI · Set in Cormorant, Newsreader &amp; Courier Prime
        <br />
        Every issue carries its provenance in ink. The machine helps; the human
        signs. <span className="text-accent">Sources kept, always.</span>
      </div>
    </footer>
  );
}
