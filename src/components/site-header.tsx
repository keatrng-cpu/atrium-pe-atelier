import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { AuthSlot } from "@/components/auth-slot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/house", label: "House" },
  { to: "/desk", label: "Desk" },
  { to: "/ladder", label: "The Ladder" },
  { to: "/performers", label: "High Performers" },
  { to: "/mastery", label: "Mastery" },
  { to: "/firms", label: "Firms" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-sm border border-accent/40 text-[11px] tracking-[0.18em] text-accent">
            A
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl tracking-tight text-fg">Atrium</span>
            <span className="mt-0.5 hidden text-[9px] uppercase tracking-[0.22em] text-subtle sm:block">
              Career Atelier
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative text-[12px] uppercase tracking-[0.16em] transition-colors duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ease-[var(--ease-smooth-out)]",
                    active ? "w-full" : "w-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <AuthSlot />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="xl:hidden"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Link to="/" onClick={() => setOpen(false)} className="font-display text-2xl">
            Atrium
          </Link>
          <nav className="mt-10 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm uppercase tracking-[0.16em] text-muted hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/studio"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              Studio
            </Link>
            <Link
              to="/correspondence"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm uppercase tracking-[0.16em] text-muted hover:text-fg"
            >
              Correspondence
            </Link>
          </nav>
          <div className="mt-8 sm:hidden">
            <AuthSlot />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
