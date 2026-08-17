import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { BriefBox } from "@/components/desk/fields";
import { LboPanel } from "@/components/desk/lbo-panel";
import { CarryPanel } from "@/components/desk/carry-panel";
import { DraftPanel } from "@/components/desk/draft-panel";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { askCounsel, type CounselMessage } from "@/lib/server/counsel";
import { listWork, saveWork, type WorkRow } from "@/lib/server/work";
import { jobs, jobsForRank, type JobKind } from "@/data/jobs";
import { ranks, type RankId } from "@/data/ranks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  const { user, isPending } = useCurrentUserState();
  const [rank, setRank] = useState<RankId>("analyst");
  const [kind, setKind] = useState<JobKind>("lbo");
  const [brief, setBrief] = useState("");
  const [computed, setComputed] = useState("");
  const [messages, setMessages] = useState<CounselMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState<WorkRow[]>([]);

  const available = useMemo(() => jobsForRank(rank), [rank]);
  const job = jobs.find((j) => j.id === kind) ?? jobs[0];

  useEffect(() => {
    if (!available.some((j) => j.id === kind)) {
      setKind(available[0]?.id ?? "counsel");
    }
  }, [available, kind]);

  useEffect(() => {
    if (isPending || !user) return;
    listWork()
      .then(setLibrary)
      .catch(() => setLibrary([]));
  }, [isPending, user]);

  if (isPending) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="h-10 w-48 animate-pulse rounded-md bg-elevated" />
          <div className="mt-8 h-80 animate-pulse rounded-xl bg-surface" />
        </div>
      </PageShell>
    );
  }

  async function runCounsel(nextUser: string, nextComputed?: string) {
    if (!user) {
      toast.error("Sign in to consult Counsel.");
      return;
    }
    const history: CounselMessage[] = [...messages, { role: "user", content: nextUser }];
    setMessages(history);
    setBusy(true);
    try {
      const result = await askCounsel({
        data: {
          rankId: rank,
          kind,
          messages: history,
          computed: nextComputed ?? computed,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const next = [...history, { role: "assistant" as const, content: result.text }];
      setMessages(next);
      const title = `${job.title} · ${new Date().toLocaleDateString("en-GB")}`;
      await saveWork({
        data: {
          kind,
          title,
          inputJson: JSON.stringify({ brief: nextUser, computed: nextComputed ?? computed }),
          outputJson: JSON.stringify({ text: result.text }),
        },
      });
      setLibrary(await listWork());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Counsel failed");
    } finally {
      setBusy(false);
    }
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <PageShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">The desk</p>
            <h1 className="mt-2 font-display text-4xl text-fg">Do the work of the seat.</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Engines compute. Counsel explains. Same rule as a serious trading desk: the model
              never invents a number.
            </p>
          </div>
          <p className="text-sm text-subtle">
            {user ? (user.displayName ?? "Member") : "Guest"} ·{" "}
            {ranks.find((r) => r.id === rank)?.shortTitle}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[15rem_1fr]">
        <aside className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Seat</p>
            <div className="mt-3 flex flex-col gap-1">
              {ranks.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRank(r.id)}
                  className={cn(
                    "min-h-11 rounded-md px-3 text-left text-[12px] uppercase tracking-[0.12em] transition-colors duration-150",
                    rank === r.id
                      ? "bg-accent text-accent-fg"
                      : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  {r.shortTitle}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Jobs of this seat</p>
            <div className="mt-3 flex flex-col gap-1">
              {available.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setKind(j.id)}
                  className={cn(
                    "min-h-11 rounded-md px-3 text-left text-sm transition-colors duration-150",
                    kind === j.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {j.title}
                  <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-subtle">
                    {j.engine}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-accent">{job.engine}</p>
            <h2 className="mt-2 font-display text-3xl text-fg">{job.title}</h2>
            <div className="mt-6">
              {kind === "lbo" || kind === "attribution" ? (
                <LboPanel
                  onSendToCounsel={(block, prompt) => {
                    setComputed(block);
                    void runCounsel(prompt, block);
                  }}
                />
              ) : kind === "carry" ? (
                <CarryPanel />
              ) : kind === "counsel" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted">{job.brief}</p>
                  <BriefBox
                    value={brief}
                    onChange={setBrief}
                    placeholder="A live process, a CEO, a promotion, a pass you are not sure you can defend."
                  />
                  <Button
                    type="button"
                    disabled={busy || brief.trim().length < 4}
                    onClick={() => {
                      const q = brief.trim();
                      setBrief("");
                      void runCounsel(q);
                    }}
                  >
                    {busy ? "Counsel is thinking…" : user ? "Consult" : "Sign in to consult"}
                  </Button>
                </div>
              ) : (
                <DraftPanel
                  job={job}
                  brief={brief}
                  onBrief={setBrief}
                  busy={busy}
                  onAsk={() => {
                    const seed = job.promptHint
                      ? `${job.promptHint}\n\nFacts from the desk:\n${brief.trim()}`
                      : brief.trim();
                    void runCounsel(seed);
                  }}
                />
              )}
            </div>
          </article>

          {lastAssistant ? (
            <article className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Counsel</p>
              <div className="mt-4 space-y-3 whitespace-pre-wrap font-serif text-[17px] leading-relaxed text-fg">
                {lastAssistant.content}
              </div>
            </article>
          ) : null}

          <article>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-fg">Library</h2>
              <Link
                to="/studio"
                className="text-[11px] uppercase tracking-[0.16em] text-accent hover:text-fg"
              >
                Studio
              </Link>
            </div>
            {library.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                {user ? "Filed work will appear here." : "Sign in to file work to your library."}
              </p>
            ) : (
              <ul className="mt-5 space-y-2">
                {library.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{row.kind}</p>
                      <p className="mt-1 text-sm text-fg">{row.title}</p>
                    </div>
                    <p className="text-[11px] tabular-nums text-subtle">
                      {new Date(row.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </PageShell>
  );
}
