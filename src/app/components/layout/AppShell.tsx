import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
