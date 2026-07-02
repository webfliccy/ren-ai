import { ToolCard } from "@/components/ToolCard";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import styles from "../dispatches/field-notes.module.css";

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
        <p className={styles.empty}>Nothing in the workshop yet.</p>
      ) : (
        <div className={styles.toolsGrid}>
          {allTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
