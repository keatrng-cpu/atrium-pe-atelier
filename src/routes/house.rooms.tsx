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
import { saveMeeting } from "@/lib/server/house";
import { labelOf, meetingKinds } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/rooms")({ component: RoomsPage });

function RoomsPage() {
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("pipeline");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("Boardroom");
  const [agenda, setAgenda] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <HouseSkeleton />;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveMeeting({ data: { title, kind, startsAt: when, location, agenda } });
      setTitle("");
      setAgenda("");
      toast.success("Room booked.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HouseShell house={bundle}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Meeting rooms</p>
      <h2 className="mt-2 font-display text-4xl text-fg">The rooms</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        IC, pipeline, portfolio, diligence stand-up. Enter a room to take attendance, minutes, and
        a decision.
      </p>

      <ul className="mt-8 space-y-2">
        {bundle.meetings.map((room) => (
          <li key={room.id}>
            <Link
              to="/house/rooms/$id"
              params={{ id: room.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                  {labelOf(meetingKinds, room.kind)} · {room.status}
                </p>
                <p className="mt-1 text-sm text-fg">{room.title}</p>
                <p className="text-[11px] text-muted">
                  {room.location} · {room.startsAt || "unscheduled"}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-accent">Enter room</span>
            </Link>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => void onCreate(e)}
        className="mt-10 space-y-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
      >
        <h3 className="font-display text-2xl text-fg">Book a room</h3>
        <div className="space-y-2">
          <Label htmlFor="rt">Title</Label>
          <Input
            id="rt"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="IC — Helix Clinical"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="when">Date</Label>
            <Input id="when" type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {meetingKinds.map((k) => (
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
        <div className="space-y-2">
          <Label htmlFor="ag">Agenda</Label>
          <Textarea id="ag" className="min-h-24" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Booking…" : "Book the room"}
        </Button>
      </form>
    </HouseShell>
  );
}
