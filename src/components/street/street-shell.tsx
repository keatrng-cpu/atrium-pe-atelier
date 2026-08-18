import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const links = [
  { to: "/street", label: "The seat", exact: true },
  { to: "/street/spread", label: "The spread", exact: false },
  { to: "/street/quality", label: "High vs low", exact: false },
  { to: "/street/highlights", label: "Highlights", exact: false },
] as const;

export function StreetShell({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <PageShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">{kicker}</p>
          <h1 className="mt-3 font-display text-4xl text-fg sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base text-muted">{lede}</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 sm:px-8">
          {links.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.14em]",
                  active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
    </PageShell>
  );
}
