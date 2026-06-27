import type { Tool } from "@/db/schema";
import styles from "@/app/homepage.module.css";

export function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      {tool.category && (
        <div className={styles.toolHead}>
          <span className={styles.toolVersion}>{tool.category}</span>
        </div>
      )}
      {tool.illustration && (
        <div
          className={styles.toolSvg}
          dangerouslySetInnerHTML={{ __html: tool.illustration }}
        />
      )}
      <div className={styles.toolBody}>
        <h4>{tool.name}</h4>
        {tool.descriptor && <p>{tool.descriptor}</p>}
        <span className={styles.toolCta}>
          Open the tool <span className={styles.arrow}>→</span>
        </span>
      </div>
    </>
  );

  return tool.url ? (
    <a className={styles.tool} href={tool.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <div className={styles.tool}>{inner}</div>
  );
}
