import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { updateSeat } from "@/lib/server/house";
import { houseFunctions, houseSeats, labelOf } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/seats")({ component: SeatsPage });

function SeatsPage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <HouseSkeleton />;

  return (
    <HouseShell house={bundle}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Coverage</p>
      <h2 className="mt-2 font-display text-4xl text-fg">Seats and functions</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Every member holds a seat on the ladder and a function on the machine. Share the invite
        code {bundle.house.inviteCode} to seat someone new.
      </p>

      <ul className="mt-8 space-y-4">
        {bundle.members.map((m) => (
          <li key={m.userId} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl text-fg">{m.givenName || "Member"}</h3>
                <p className="text-sm text-muted">
                  {labelOf(houseSeats, m.seat)} · {labelOf(houseFunctions, m.fn)}
                  {m.title ? ` · ${m.title}` : ""}
                </p>
              </div>
              {m.lastSeen ? (
                <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">On the floor</p>
              ) : null}
            </div>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Seat</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {houseSeats.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      void updateSeat({
                        data: { userId: m.userId, seat: s.id, fn: m.fn, title: m.title },
                      })
                        .then(() => refresh())
                        .catch((err) =>
                          toast.error(err instanceof Error ? err.message : "Could not assign"),
                        )
                    }
                    className={cn(
                      "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                      m.seat === s.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                    )}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Function</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {houseFunctions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      void updateSeat({
                        data: { userId: m.userId, seat: m.seat, fn: f.id, title: m.title },
                      }).then(() => refresh())
                    }
                    className={cn(
                      "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em]",
                      m.fn === f.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {houseFunctions.map((f) => {
          const holders = bundle.members.filter((m) => m.fn === f.id);
          return (
            <article key={f.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-2xl text-fg">{f.label}</h3>
              <p className="mt-2 text-sm text-muted">{f.brief}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-subtle">
                {holders.length === 0
                  ? "Uncovered"
                  : holders.map((h) => h.givenName || "Member").join(" · ")}
              </p>
            </article>
          );
        })}
      </div>
    </HouseShell>
  );
}
