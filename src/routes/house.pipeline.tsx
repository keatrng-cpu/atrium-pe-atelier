import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { addWorkstream, saveDeal, setWorkstreamStatus } from "@/lib/server/house";
import { dealStages, labelOf } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/pipeline")({ component: PipelinePage });

function PipelinePage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [ev, setEv] = useState("");
  const [stage, setStage] = useState("sourcing");
  const [action, setAction] = useState("");
  const [due, setDue] = useState("");
  const [thesis, setThesis] = useState("");
  const [busy, setBusy] = useState(false);
  const [openDeal, setOpenDeal] = useState<string | null>(null);
  const [wsTitle, setWsTitle] = useState("");

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) {
    return (
      <HouseSkeleton />
    );
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveDeal({
        data: {
          name,
          sector,
          stage,
          enterpriseValue: ev,
          nextAction: action,
          dueOn: due,
          thesis,
        },
      });
      setName("");
      setSector("");
      setEv("");
      setAction("");
      setThesis("");
      toast.success("Process added.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HouseShell house={bundle}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Origination & execution</p>
          <h2 className="mt-2 font-display text-4xl text-fg">The book</h2>
        </div>
        <Link to="/house" className="text-[11px] uppercase tracking-[0.16em] text-subtle">
          Floor
        </Link>
      </div>

      <div className="mt-8 -mx-5 overflow-x-auto px-5">
        <div className="flex min-w-[64rem] gap-3">
          {dealStages.map((col) => {
            const cards = bundle.deals.filter((d) => d.stage === col.id);
            return (
              <div key={col.id} className="w-44 shrink-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                  {col.label} · {cards.length}
                </p>
                <ul className="mt-3 space-y-2">
                  {cards.map((deal) => (
                    <li key={deal.id}>
                      <button
                        type="button"
                        onClick={() => setOpenDeal(openDeal === deal.id ? null : deal.id)}
                        className="w-full rounded-xl bg-surface p-3 text-left shadow-[var(--shadow-border)]"
                      >
                        <p className="text-sm text-fg">{deal.name}</p>
                        <p className="mt-1 text-[11px] text-subtle">{deal.enterpriseValue}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {openDeal
        ? bundle.deals
            .filter((d) => d.id === openDeal)
            .map((deal) => {
              const streams = bundle.workstreams.filter((w) => w.dealId === deal.id);
              return (
                <article
                  key={deal.id}
                  className="mt-8 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
                    {labelOf(dealStages, deal.stage)}
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-fg">{deal.name}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {deal.sector} · {deal.enterpriseValue}
                  </p>
                  <p className="mt-4 text-sm text-fg">{deal.thesis}</p>
                  <p className="mt-3 text-sm text-muted">
                    Next: {deal.nextAction || "—"} {deal.dueOn ? `· ${deal.dueOn}` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dealStages.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          void saveDeal({
                            data: {
                              id: deal.id,
                              name: deal.name,
                              sector: deal.sector,
                              stage: s.id,
                              enterpriseValue: deal.enterpriseValue,
                              ownerId: deal.ownerId,
                              nextAction: deal.nextAction,
                              dueOn: deal.dueOn,
                              thesis: deal.thesis,
                            },
                          }).then(() => refresh());
                        }}
                        className={cn(
                          "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                          deal.stage === s.id
                            ? "bg-accent text-accent-fg"
                            : "bg-elevated text-muted",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <h4 className="mt-8 text-[11px] uppercase tracking-[0.16em] text-subtle">
                    Diligence workstreams
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {streams.map((ws) => (
                      <li key={ws.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className={ws.status === "done" ? "text-subtle line-through" : "text-fg"}>
                          {ws.title}
                        </span>
                        <button
                          type="button"
                          className="text-[11px] uppercase tracking-[0.12em] text-accent"
                          onClick={() =>
                            void setWorkstreamStatus({
                              data: { id: ws.id, status: ws.status === "done" ? "open" : "done" },
                            }).then(() => refresh())
                          }
                        >
                          {ws.status === "done" ? "Reopen" : "Clear"}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form
                    className="mt-4 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!wsTitle.trim()) return;
                      void addWorkstream({ data: { dealId: deal.id, title: wsTitle.trim() } })
                        .then(() => {
                          setWsTitle("");
                          return refresh();
                        })
                        .catch((err) =>
                          toast.error(err instanceof Error ? err.message : "Could not add"),
                        );
                    }}
                  >
                    <Input
                      value={wsTitle}
                      onChange={(e) => setWsTitle(e.target.value)}
                      placeholder="New workstream"
                    />
                    <Button type="submit" variant="outline">
                      Add
                    </Button>
                  </form>
                </article>
              );
            })
        : null}

      <form
        onSubmit={(e) => void onAdd(e)}
        className="mt-10 space-y-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
      >
        <h3 className="font-display text-2xl text-fg">New process</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dn">Name</Label>
            <Input id="dn" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds">Sector</Label>
            <Input id="ds" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev">Enterprise value</Label>
            <Input id="ev" value={ev} onChange={(e) => setEv(e.target.value)} placeholder="$400m" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Next date</Label>
            <Input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="na">Next action</Label>
          <Input id="na" value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="th">Working thesis</Label>
          <Textarea id="th" className="min-h-24" value={thesis} onChange={(e) => setThesis(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {dealStages.slice(0, 6).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              className={cn(
                "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                stage === s.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Filing…" : "Add to the book"}
        </Button>
      </form>
    </HouseShell>
  );
}
