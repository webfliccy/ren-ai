"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dispatches & Field Notes", href: "/dispatches" },
  { label: "Tools & Contraptions", href: "/tools" },
  { label: "The Archive", href: "/issues" },
  { label: "About the Fan", href: "/about" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mb-12 flex justify-center gap-10 border-b border-rule pt-3 pb-[38px] max-tablet:flex-wrap max-tablet:gap-5">
      {NAV.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "bg-[var(--color-highlight)] text-[10.5px] font-bold tracking-[0.15em] text-accent uppercase"
                : "text-[10.5px] font-bold tracking-[0.15em] text-ink uppercase no-underline opacity-[0.78] hover:text-accent hover:opacity-100"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
