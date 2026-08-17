import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import type { HouseBundle } from "@/lib/server/house";
import { cn } from "@/lib/utils";

const links = [
  { to: "/house", label: "Floor", exact: true },
  { to: "/house/pipeline", label: "Pipeline", exact: false },
  { to: "/house/rooms", label: "Rooms", exact: false },
  { to: "/house/alerts", label: "Alerts", exact: false },
  { to: "/house/portfolio", label: "Portfolio", exact: false },
  { to: "/house/seats", label: "Seats", exact: false },
] as const;

export function HouseShell({
  house,
  children,
}: {
  house: HouseBundle;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openAlerts = house.alerts.filter((a) => !a.readAt).length;

  return (
    <PageShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">The house</p>
            <h1 className="mt-1 font-display text-3xl text-fg sm:text-4xl">{house.house.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {house.me.givenName || "Member"} · {house.me.seat.replaceAll("-", " ")} ·{" "}
              {house.me.fn.replaceAll("-", " ")}
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">
            Invite {house.house.inviteCode}
          </p>
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
                  "shrink-0 rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-150",
                  active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
                {item.to === "/house/alerts" && openAlerts > 0 ? ` · ${openAlerts}` : ""}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
    </PageShell>
  );
}

export function HouseSkeleton() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-10 w-56 animate-pulse rounded-md bg-elevated" />
        <div className="mt-8 h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    </PageShell>
  );
}
