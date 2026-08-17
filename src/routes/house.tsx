import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { DemoTag, HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { clearDemoBook, createHouse, joinHouse, leaveHouse } from "@/lib/server/house";
import { loadProfile } from "@/lib/server/profile";
import { dealStages, houseFunctions, houseSeats, labelOf } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house")({ component: HousePage });

function HousePage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [clearing, setClearing] = useState(false);

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <FoundHouse onDone={refresh} />;

  const live = bundle.deals.filter((d) => !["closed", "passed"].includes(d.stage));
  const openAlerts = bundle.alerts.filter((a) => !a.readAt);
  const rooms = bundle.meetings.filter((m) => m.status !== "adjourned");
  const demoRows =
    bundle.deals.filter((d) => d.seeded).length +
    bundle.meetings.filter((m) => m.seeded).length +
    bundle.alerts.filter((a) => a.seeded).length +
    bundle.portfolio.filter((c) => c.seeded).length;
  const present = bundle.members.filter((m) => {
    if (!m.lastSeen) return false;
    return Date.now() - new Date(m.lastSeen).getTime() < 5 * 60 * 1000;
  });

  return (
    <HouseShell house={bundle}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Live processes" value={String(live.length)} />
        <Stat label="Open alerts" value={String(openAlerts.length)} />
        <Stat label="Rooms" value={String(rooms.length)} />
        <Stat label="On the floor" value={String(present.length || 1)} />
      </div>

      {demoRows > 0 ? (
        <section className="mt-8 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.16em] text-accent">Demo book</p>
              <p className="mt-2 text-sm text-fg">
                This house opened with {demoRows} demo {demoRows === 1 ? "record" : "records"} so the
                room was not empty. They are marked <span className="text-subtle">Demo</span> wherever
                they appear.
              </p>
              <p className="mt-2 text-sm text-muted">
                Clearing removes every demo process, room, watch, and holding — along with anything
                filed against them, including workstreams and floor notes you added yourself. Your
                own processes and holdings are untouched.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={clearing}
              onClick={() => {
                setClearing(true);
                void clearDemoBook()
                  .then(() => refresh())
                  .then(() => toast.success("The demo book is cleared."))
                  .catch((err) =>
                    toast.error(err instanceof Error ? err.message : "Could not clear the book"),
                  )
                  .finally(() => setClearing(false));
              }}
            >
              {clearing ? "Clearing…" : "Clear the demo book"}
            </Button>
          </div>
        </section>
      ) : null}

      {bundle.house.thesis ? (
        <blockquote className="mt-8 font-display text-2xl italic text-fg sm:text-3xl">
          {bundle.house.thesis}
        </blockquote>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-fg">Live book</h2>
            <Link to="/house/pipeline" className="text-[11px] uppercase tracking-[0.16em] text-accent">
              Pipeline
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {live.slice(0, 5).map((deal) => (
              <li
                key={deal.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 break-words text-sm text-fg">
                    {deal.name}
                    {deal.seeded ? <DemoTag /> : null}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
                    {labelOf(dealStages, deal.stage)} · {deal.sector}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-muted">{deal.enterpriseValue}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-fg">Rooms today</h2>
            <Link to="/house/rooms" className="text-[11px] uppercase tracking-[0.16em] text-accent">
              All rooms
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {rooms.slice(0, 4).map((room) => (
              <li key={room.id}>
                <Link
                  to="/house/rooms/$id"
                  params={{ id: room.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                >
                  <div>
                    <p className="text-sm text-fg">{room.title}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
                      {room.location} · {room.startsAt || "unscheduled"}
                    </p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-accent">Enter</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-fg">Watches</h2>
          <Link to="/house/alerts" className="text-[11px] uppercase tracking-[0.16em] text-accent">
            Alerts
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {openAlerts.slice(0, 4).map((alert) => (
            <li
              key={alert.id}
              className="rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]"
            >
              <p className="text-[10px] uppercase tracking-[0.16em] text-accent">{alert.severity}</p>
              <p className="mt-1 text-sm text-fg">{alert.title}</p>
              <p className="mt-1 text-sm text-muted">{alert.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void leaveHouse()
              .then(() => refresh())
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not leave"));
          }}
        >
          Leave this house
        </Button>
      </div>
    </HouseShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-fg">{value}</p>
    </div>
  );
}

function FoundHouse({ onDone }: { onDone: () => Promise<void> }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [thesis, setThesis] = useState("");
  const [mandate, setMandate] = useState("");
  const [code, setCode] = useState("");
  const [seat, setSeat] = useState("partner");
  const [fn, setFn] = useState("origination");
  const [busy, setBusy] = useState(false);

  async function givenName() {
    try {
      const p = await loadProfile();
      return p.givenName;
    } catch {
      return "";
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createHouse({
        data: { name, thesis, mandate, seat, fn, givenName: await givenName() },
      });
      toast.success("The house is open.");
      await onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not found the house");
    } finally {
      setBusy(false);
    }
  }

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await joinHouse({
        data: { code, seat, fn, givenName: await givenName() },
      });
      toast.success("You are seated.");
      await onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageIntro
        kicker="The house"
        title="A partnership that actually works."
        lede="Found a house or sit in one. Seats, functions, pipeline, rooms, portfolio, and alerts — the machine a PE team runs every week."
      />
      <section className="mx-auto max-w-2xl px-5 pb-24 sm:px-8">
        <div className="mb-8 flex gap-2">
          {(["create", "join"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "h-10 rounded-full px-4 text-[11px] uppercase tracking-[0.14em]",
                mode === id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {id === "create" ? "Found a house" : "Join with a code"}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => void (mode === "create" ? onCreate(e) : onJoin(e))}
          className="space-y-5 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
        >
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="hname">House name</Label>
                <Input
                  id="hname"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Northbridge Partners"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thesis">Investment thesis</Label>
                <Textarea
                  id="thesis"
                  className="min-h-24"
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Where you have a right to win."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mandate">Mandate</Label>
                <Input
                  id="mandate"
                  value={mandate}
                  onChange={(e) => setMandate(e.target.value)}
                  placeholder="UMM buyouts · $150–600m EV · services & healthcare"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="code">Invite code</Label>
              <Input
                id="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SIXCHR"
                className="tracking-[0.2em]"
              />
            </div>
          )}

          <div>
            <Label>Your seat</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {houseSeats.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeat(s.id)}
                  className={cn(
                    "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em]",
                    seat === s.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                  )}
                >
                  {s.short}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Function</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {houseFunctions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFn(f.id)}
                  className={cn(
                    "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em]",
                    fn === f.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={busy}>
            {busy ? "One moment…" : mode === "create" ? "Open the house" : "Take your seat"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
