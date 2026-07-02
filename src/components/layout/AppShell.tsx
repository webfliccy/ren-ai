import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-texture-page bg-parchment px-5 pb-20 font-figtree leading-[1.6] text-ink antialiased [&_a]:text-inherit">
      <div className="mx-auto max-w-[1180px]">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
