import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ToolCard } from "@/components/ToolCard";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import styles from "@/app/field-notes/field-notes.module.css";

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
    <div className={styles.page}>
      <div className={styles.sheet}>
        <SiteHeader activePath="/tools" />


        {allTools.length === 0 ? (
          <p className={styles.empty}>Nothing in the workshop yet.</p>
        ) : (
          <div className={styles.toolsGrid}>
            {allTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        <SiteFooter />
      </div>
    </div>
  );
}
