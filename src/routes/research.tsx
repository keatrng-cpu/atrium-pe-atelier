import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { commissionResearch, listBriefs, type ResearchBrief } from "@/lib/server/research";
import { researchKinds, type ResearchKind } from "@/data/research";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({ component: ResearchPage });

function ResearchPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [kind, setKind] = useState<ResearchKind>("company");
  const [query, setQuery] = useState("");
  const [ticker, setTicker] = useState("");
  const [busy, setBusy] = useState(false);
  const [briefs, setBriefs] = useState<ResearchBrief[]>([]);

  useEffect(() => {
    if (isPending || !user) return;
    listBriefs()
      .then(setBriefs)
      .catch(() => setBriefs([]));
  }, [isPending, user]);

  if (isPending) {
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

  const hint = researchKinds.find((k) => k.id === kind)?.hint ?? "";

  async function onCommission(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await commissionResearch({
        data: { kind, query: query.trim(), ticker },
      });
      toast.success("Reviewed. Open the brief.");
      await navigate({ to: "/research/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Research failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageIntro
        kicker="Research"
        title="Backed, reviewed, then published."
        lede="The desk searches the open web, writes a brief a partner can circulate, and a second partner grades it against the sources. Public tapes are computed. Nothing is invented."
      />

      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <form
          onSubmit={(e) => void onCommission(e)}
          className="space-y-5 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8"
        >
          <div className="flex flex-wrap gap-2">
            {researchKinds.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em]",
                  kind === k.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">{hint}</p>
          <div className="space-y-2">
            <Label htmlFor="rq">What should we know</Label>
            <Textarea
              id="rq"
              required
              minLength={3}
              className="min-h-28"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Helix Clinical reimbursement risk after the 2026 CMS draft — or a sector, a portfolio name, a multiple."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tk">Public ticker · optional</Label>
            <Input
              id="tk"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="If listed — we compute the tape ourselves"
              className="max-w-xs uppercase"
            />
          </div>
          <Button type="submit" disabled={busy || query.trim().length < 3}>
            {busy ? "Searching, writing, reviewing…" : "Commission the brief"}
          </Button>
          <p className="text-xs text-subtle">
            This sitting uses live search and a second review pass. Commission only when you need the
            page.
          </p>
        </form>

        <div className="mt-14">
          <h2 className="font-display text-3xl text-fg">The book</h2>
          {briefs.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No briefs yet.</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {briefs.map((b) => (
                <li key={b.id}>
                  <Link
                    to="/research/$id"
                    params={{ id: b.id }}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                        {b.kind} · {b.status} · {b.review.grade}
                      </p>
                      <p className="mt-1 truncate text-sm text-fg">{b.title || b.query}</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-accent">Read</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
