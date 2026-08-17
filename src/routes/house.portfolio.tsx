import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { savePortfolio } from "@/lib/server/house";
import { healthStates, labelOf } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/portfolio")({ component: PortfolioPage });

function PortfolioPage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [year, setYear] = useState("");
  const [kpi, setKpi] = useState("");
  const [health, setHealth] = useState("on-plan");
  const [board, setBoard] = useState("");

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <HouseSkeleton />;

  return (
    <HouseShell house={bundle}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Portfolio</p>
      <h2 className="mt-2 font-display text-4xl text-fg">Companies we own</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Health versus the underwrite. Next board. The note a partner can read in thirty seconds.
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {bundle.portfolio.map((co) => (
          <li key={co.id} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-accent">
              {labelOf(healthStates, co.health)} · {co.entryYear}
            </p>
            <h3 className="mt-2 font-display text-3xl text-fg">{co.name}</h3>
            <p className="mt-1 text-sm text-subtle">{co.sector}</p>
            <p className="mt-4 text-sm text-muted">{co.kpiNote}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-subtle">
              Next board {co.nextBoard || "—"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {healthStates.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() =>
                    void savePortfolio({
                      data: {
                        id: co.id,
                        name: co.name,
                        sector: co.sector,
                        entryYear: co.entryYear,
                        ownerId: co.ownerId,
                        kpiNote: co.kpiNote,
                        health: h.id,
                        nextBoard: co.nextBoard,
                      },
                    }).then(() => refresh())
                  }
                  className={cn(
                    "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                    co.health === h.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <form
        className="mt-10 space-y-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void savePortfolio({
            data: {
              name,
              sector,
              entryYear: year,
              kpiNote: kpi,
              health,
              nextBoard: board,
            },
          })
            .then(() => {
              setName("");
              setKpi("");
              toast.success("Company seated.");
              return refresh();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Could not add"));
        }}
      >
        <h3 className="font-display text-2xl text-fg">Add a company</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cn">Name</Label>
            <Input id="cn" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs">Sector</Label>
            <Input id="cs" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cy">Entry year</Label>
            <Input id="cy" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb">Next board</Label>
            <Input id="cb" type="date" value={board} onChange={(e) => setBoard(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ck">KPI note</Label>
          <Textarea id="ck" className="min-h-20" value={kpi} onChange={(e) => setKpi(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {healthStates.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHealth(h.id)}
              className={cn(
                "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                health === h.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
        <Button type="submit">Seat the company</Button>
      </form>
    </HouseShell>
  );
}
