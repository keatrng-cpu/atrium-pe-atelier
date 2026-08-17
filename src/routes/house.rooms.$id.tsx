import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { HouseShell, HouseSkeleton } from "@/components/house/house-shell";
import { useHouse } from "@/components/house/use-house";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  addRoomNote,
  listAttendance,
  listRoomNotes,
  setAttendance,
  updateMeetingRoom,
} from "@/lib/server/house";
import { labelOf, meetingKinds } from "@/data/house";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/house/rooms/$id")({ component: RoomPage });

function RoomPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const { bundle, ready, refresh } = useHouse();
  const [minutes, setMinutes] = useState("");
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ id: string; author: string; body: string }[]>([]);
  const [attendance, setAtt] = useState<{ userId: string; status: string }[]>([]);

  const room = bundle?.meetings.find((m) => m.id === id);

  useEffect(() => {
    if (room) {
      setMinutes(room.minutes);
      setDecision(room.decision);
    }
  }, [room?.id, room?.minutes, room?.decision]);

  useEffect(() => {
    if (!user) return;
    listRoomNotes({ data: { meetingId: id } })
      .then(setNotes)
      .catch(() => setNotes([]));
    listAttendance({ data: { meetingId: id } })
      .then(setAtt)
      .catch(() => setAtt([]));
  }, [id, user]);

  if (isPending || (user && !ready)) return <HouseSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (!bundle) return <HouseSkeleton />;
  if (!room) {
    return (
      <HouseShell house={bundle}>
        <p className="text-muted">This room is not on the book.</p>
        <Link to="/house/rooms" className="mt-4 inline-block text-accent">
          Back to rooms
        </Link>
      </HouseShell>
    );
  }

  async function persist(partial: { minutes?: string; decision?: string; status?: "scheduled" | "in-session" | "adjourned" }) {
    try {
      await updateMeetingRoom({ data: { id, ...partial } });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <HouseShell house={bundle}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
        {labelOf(meetingKinds, room.kind)} · {room.location}
      </p>
      <h2 className="mt-2 font-display text-4xl text-fg">{room.title}</h2>
      <p className="mt-2 text-sm text-muted">
        {room.startsAt || "Unscheduled"} · {room.status.replace("-", " ")}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={() => void persist({ status: "in-session" })}>
          Call to order
        </Button>
        <Button type="button" variant="outline" onClick={() => void persist({ status: "adjourned" })}>
          Adjourn
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            void setAttendance({ data: { meetingId: id, status: "present" } }).then(() =>
              listAttendance({ data: { meetingId: id } }).then(setAtt),
            )
          }
        >
          I am present
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Agenda</h3>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-fg">
              {room.agenda || "No agenda filed."}
            </pre>
          </article>
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Minutes</h3>
            <Textarea
              className="mt-3 min-h-40"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              onBlur={() => void persist({ minutes })}
            />
          </article>
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Decision</h3>
            <Textarea
              className="mt-3 min-h-24"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              onBlur={() => void persist({ decision })}
              placeholder="Approve / pass / more work. One sentence."
            />
            <p className="mt-3 text-[11px] leading-relaxed text-subtle">
              A working record of what the room concluded. Atrium does not take votes and this is
              not a record of corporate action — no quorum, no tally, no signature. Where a decision
              has to bind, it gets made and minuted in your firm's own books.
            </p>
          </article>
        </section>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Attendance</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {bundle.members.map((m) => {
                const row = attendance.find((a) => a.userId === m.userId);
                return (
                  <li key={m.userId} className="flex justify-between gap-3">
                    <span className="text-fg">{m.givenName || "Member"}</span>
                    <span className="text-subtle">{row?.status ?? "invited"}</span>
                  </li>
                );
              })}
            </ul>
          </article>
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Floor notes</h3>
            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li key={n.id}>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">{n.author}</p>
                  <p className="text-sm text-fg">{n.body}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                void addRoomNote({ data: { meetingId: id, body: note.trim() } })
                  .then(() => {
                    setNote("");
                    return listRoomNotes({ data: { meetingId: id } });
                  })
                  .then(setNotes)
                  .catch((err) => toast.error(err instanceof Error ? err.message : "Could not post"));
              }}
            >
              <Textarea
                className="min-h-20"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A point for the room."
              />
              <Button type="submit" variant="outline" className="w-full">
                Pass a note
              </Button>
            </form>
          </article>
        </aside>
      </div>
      <p className={cn("mt-8 text-sm text-subtle")}>
        Minutes and the decision save when you leave the field.
      </p>
    </HouseShell>
  );
}
