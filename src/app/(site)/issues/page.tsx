import { db } from "@/db";
import { issues } from "@/db/schema";
import { Kicker } from "@/components/ui/Kicker";
import { and, desc, eq, lt } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "The Archive — The RenAIssance Fan",
  description: "Every past issue of The RenAIssance Fan, in order.",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
        .where(
          and(
            eq(issues.status, "published"),
            lt(issues.number, current.number),
          ),
        )
        .orderBy(desc(issues.number))
    : [];

  return (
    <>
      <article className="mx-auto mt-12 max-w-[740px]">
        <div className="mb-[22px]">
          <Kicker tag="Archive" crumb="EVERY PAST ISSUE, IN ORDER" />
        </div>

        <h1 className="mb-5 font-cormorant text-[60px] leading-[1.02] font-semibold tracking-[-0.015em] text-balance text-ink max-mobile:text-[40px]">
          The Archive
        </h1>

        {current && (
          <p className="mb-[26px] font-newsreader text-[21px] leading-[1.5] text-pretty text-ink-light italic">
            The current issue is{" "}
            <Link href="/">
              № {current.number} — {current.title}
            </Link>
            . Past issues are below.
          </p>
        )}

        {pastIssues.length === 0 ? (
          <div className="prose">
            <p>
              No past issues yet. The archive fills as new issues are published.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            {pastIssues.map((issue, i) => (
              <div key={issue.id}>
                {i > 0 && <div className="my-8 h-px bg-border" />}
                <Link
                  href={`/issues/${issue.number}`}
                  className="block no-underline"
                >
                  <div className="mb-2 flex items-baseline gap-4">
                    <span className="font-courier text-[11px] font-bold tracking-[0.15em] text-accent uppercase">
                      № {String(issue.number).padStart(2, "0")}
                    </span>
                    <h2 className="font-cormorant text-[32px] leading-[1.1] font-semibold text-ink">
                      {issue.title}
                    </h2>
                  </div>
                  {issue.description && (
                    <p className="mb-2.5 font-newsreader text-[17px] leading-[1.5] text-ink-light italic">
                      {issue.description}
                    </p>
                  )}
                  <span className="font-courier text-[10px] tracking-1 text-muted uppercase">
                    {issue.publishedAt
                      ? formatDate(new Date(issue.publishedAt))
                      : ""}
                    {" · Read the issue →"}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
