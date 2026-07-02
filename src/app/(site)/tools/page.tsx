import { ToolCard } from "@/components/ToolCard";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata = {
  title: "Tools & Contraptions — ren·ai",
  description: "Small machines that make the big machine behave.",
};

export default async function ToolsPage() {
  const allTools = await db
    .select()
    .from(tools)
    .where(eq(tools.status, "published"))
    .orderBy(asc(tools.sortOrder), asc(tools.createdAt));

  return (
    <>
      {allTools.length === 0 ? (
        <p className="mx-auto my-15 max-w-[720px] font-newsreader text-[17px] italic text-muted">
          Nothing in the workshop yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-mobile:grid-cols-1">
          {allTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
