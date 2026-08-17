import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DemoTag, HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ackAlert, saveAlert } from "@/lib/server/house";
import { alertKinds } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/alerts")({ component: AlertsPage });

function AlertsPage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("custom");
  const [severity, setSeverity] = useState<"watch" | "urgent">("watch");
  const [due, setDue] = useState("");

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <HouseSkeleton />;

  const open = bundle.alerts.filter((a) => !a.readAt);
  const closed = bundle.alerts.filter((a) => a.readAt);

  return (
    <HouseShell house={bundle}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Watches</p>
      <h2 className="mt-2 font-display text-4xl text-fg">Alerts</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        IC prep, deadlines, covenants, KPI misses. The house does not run on memory.
      </p>

      <ul className="mt-8 space-y-2">
        {open.map((alert) => (
          <li
            key={alert.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-accent">
                {alert.severity} · {alert.kind}
                {alert.dueOn ? ` · ${alert.dueOn}` : ""}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-fg">
                {alert.title}
                {alert.seeded ? <DemoTag /> : null}
              </p>
              <p className="mt-1 text-sm text-muted">{alert.body}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void ackAlert({ data: { id: alert.id } })
                  .then(() => refresh())
                  .catch((err) => toast.error(err instanceof Error ? err.message : "Could not clear"))
              }
            >
              Clear
            </Button>
          </li>
        ))}
      </ul>

      {closed.length > 0 ? (
        <p className="mt-6 text-sm text-subtle">{closed.length} cleared this book.</p>
      ) : null}

      <form
        className="mt-10 space-y-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void saveAlert({ data: { title, body, kind, severity, dueOn: due } })
            .then(() => {
              setTitle("");
              setBody("");
              toast.success("Watch filed.");
              return refresh();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Could not file"));
        }}
      >
        <h3 className="font-display text-2xl text-fg">New watch</h3>
        <div className="space-y-2">
          <Label htmlFor="at">Title</Label>
          <Input id="at" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ab">Note</Label>
          <Textarea id="ab" className="min-h-20" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad">Due</Label>
          <Input id="ad" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {alertKinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                kind === k.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["watch", "urgent"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={cn(
                "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                severity === s ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Button type="submit">File the watch</Button>
      </form>
    </HouseShell>
  );
}
