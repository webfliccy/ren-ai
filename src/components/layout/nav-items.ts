export const NAV = [
  { label: "Dispatches & Field Notes", href: "/dispatches" },
  { label: "Tools & Contraptions", href: "/tools" },
  { label: "The Archive", href: "/issues" },
  { label: "About the Fan", href: "/about" },
] as const;

export function isActiveNavHref(
  pathname: string | null,
  href: string,
): boolean {
  return pathname === href;
}
