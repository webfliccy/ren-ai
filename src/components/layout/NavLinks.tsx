"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

const NAV = [
  { label: "Dispatches & Field Notes", href: "/dispatches" },
  { label: "Tools & Contraptions", href: "/tools" },
  { label: "The Archive", href: "/issues" },
  { label: "About the Fan", href: "/about" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {NAV.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? styles.navActive : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
