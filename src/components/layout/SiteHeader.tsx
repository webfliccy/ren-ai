import { db } from "@/db";
import { issues } from "@/db/schema";
import { RenaiLogo } from "@/components/RenaiLogo";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { NavLinks } from "./NavLinks";

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
      <div className="mb-1 flex w-full items-center gap-3.5 pt-6">
        <div className="h-px flex-1 bg-rule" />
        <div className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.24em] text-ink opacity-60">
          {topbarStamp}
        </div>
        <div className="h-px flex-1 bg-rule" />
      </div>
      <div className="h-[3px] bg-ink" />
      <div style={{ height: 2 }} />
      <div className="h-px bg-ink" />

      <div className="relative flex items-center justify-center pt-5 pb-4">
        <Link className="absolute left-0 flex items-center gap-3.5 no-underline" href="/" aria-label="The RenAIssance Fan — home">
          <RenaiLogo className="block h-[58px] w-auto max-tablet:h-[42px]" />
          <span className="h-11 w-px bg-ink opacity-20" />
        </Link>
        <Link
          href="/"
          className="text-center font-cormorant text-[52px] font-medium italic leading-none tracking-[-0.01em] text-inherit no-underline max-tablet:text-[32px]"
        >
          The Ren<span className="text-accent">AI</span>ssance Fan
          <span className="mt-2 block text-[9.5px] font-semibold uppercase tracking-[0.34em] text-ink-light opacity-70">
            Fallibly Human, Artificially Divine
          </span>
        </Link>
      </div>

      <div className="h-px bg-ink" />
      <div style={{ height: 2 }} />
      <div className="h-[3px] bg-ink" />

      <NavLinks />
    </header>
  );
}
