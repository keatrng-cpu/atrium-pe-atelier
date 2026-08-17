import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadStudio, saveStudio, type ProgressRow } from "@/lib/server/atelier";
import { masterySkills } from "@/data/mastery";
import { firmTiers, ranks, type FirmTier, type RankId } from "@/data/ranks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio")({ component: StudioPage });

const statuses = [
  { id: "unstarted", label: "Unstarted" },
  { id: "practicing", label: "In practice" },
  { id: "mastered", label: "Mastered" },
] as const;

function StudioPage() {
  const { user, isPending } = useCurrentUserState();
  const [ready, setReady] = useState(false);
  const [targetRank, setTargetRank] = useState<RankId>("analyst");
  const [firmTier, setFirmTier] = useState<FirmTier>("umm");
  const [dealLog, setDealLog] = useState("");
  const [skills, setSkills] = useState<ProgressRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    loadStudio()
      .then((data) => {
        if (cancelled) return;
        setTargetRank((data.profile.targetRank as RankId) || "analyst");
        setFirmTier((data.profile.firmTier as FirmTier) || "umm");
        setDealLog(data.profile.dealLog);
        setSkills(data.skills);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSkills(
            masterySkills.map((s) => ({ skillId: s.id, status: "unstarted", notes: "" })),
          );
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (isPending || (user && !ready)) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-5 py-24">
          <div className="h-10 w-56 animate-pulse rounded-md bg-elevated" />
          <div className="mt-8 h-64 animate-pulse rounded-xl bg-surface" />
        </div>
      </PageShell>
    );
  }

  if (!user) return <RedirectToSignIn />;

  const rank = ranks.find((r) => r.id === targetRank);
  const mastered = skills.filter((s) => s.status === "mastered").length;

  async function onSave() {
    setSaving(true);
    try {
      await saveStudio({
        data: {
          targetRank,
          firmTier,
          dealLog,
          skills: skills.map((s) => ({
            skillId: s.skillId,
            status: (s.status as "unstarted" | "practicing" | "mastered") || "unstarted",
            notes: s.notes,
          })),
        },
      });
      toast.success("Studio saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <PageIntro
        kicker="The studio"
        title={`Good morning, ${user.displayName?.split(" ")[0] ?? "colleague"}.`}
        lede="Set the seat you are working toward. Keep the seven practices honest. Write the deals you do not want to misremember."
      />

      <section className="mx-auto max-w-4xl space-y-8 px-5 pb-24 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Target seat</p>
            <p className="mt-2 font-display text-2xl text-fg">{rank?.shortTitle}</p>
          </div>
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Indicative cash</p>
            <p className="mt-2 font-display text-2xl tabular-nums text-fg">
              {rank?.cash[firmTier]}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Practices mastered</p>
            <p className="mt-2 font-display text-2xl tabular-nums text-fg">
              {mastered} / {masterySkills.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Working toward</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {ranks.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTargetRank(r.id)}
                    className={cn(
                      "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em] transition-colors duration-150",
                      targetRank === r.id
                        ? "bg-accent text-accent-fg"
                        : "bg-elevated text-muted hover:text-fg",
                    )}
                  >
                    {r.shortTitle}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Firm context</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {firmTiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFirmTier(t.id)}
                    className={cn(
                      "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em] transition-colors duration-150",
                      firmTier === t.id
                        ? "bg-accent text-accent-fg"
                        : "bg-elevated text-muted hover:text-fg",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {rank ? (
            <p className="mt-6 text-sm text-muted">
              {rank.carry} Promotion window: {rank.promotionWindow}.
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-fg">Seven practices</h2>
            <Link
              to="/mastery"
              className="text-[11px] uppercase tracking-[0.16em] text-accent hover:text-fg"
            >
              Full plan
            </Link>
          </div>
          {masterySkills.map((skill) => {
            const row = skills.find((s) => s.skillId === skill.id);
            const status = row?.status ?? "unstarted";
            return (
              <article
                key={skill.id}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                      {skill.numeral}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-fg">{skill.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setSkills((prev) =>
                            prev.map((p) =>
                              p.skillId === skill.id ? { ...p, status: s.id } : p,
                            ),
                          )
                        }
                        className={cn(
                          "h-9 rounded-full px-3 text-[10px] uppercase tracking-[0.12em] transition-colors duration-150",
                          status === s.id
                            ? "bg-accent text-accent-fg"
                            : "bg-elevated text-muted hover:text-fg",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
          <Label htmlFor="deal-log">Personal deal log</Label>
          <p className="mt-2 text-sm text-muted">
            Date, thesis, decision, outcome, the lesson. Include the ones that hurt.
          </p>
          <Textarea
            id="deal-log"
            className="mt-4"
            value={dealLog}
            onChange={(e) => setDealLog(e.target.value)}
            placeholder="2026-03 — Passed on a quality asset at 14x. Thesis was multiple compression in the vertical. Revisit after the next print."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => void onSave()} disabled={saving}>
            {saving ? "Saving…" : "Save the studio"}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/correspondence">Open correspondence</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
