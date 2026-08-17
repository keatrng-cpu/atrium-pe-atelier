import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRank, nextRank, ranks } from "@/data/ranks";

export const Route = createFileRoute("/ladder/$rank")({
  component: RankPage,
});

function RankPage() {
  const { rank: rankId } = Route.useParams();
  const rank = getRank(rankId);
  if (!rank) throw notFound();
  const nxt = nextRank[rank.id];
  const next = nxt ? getRank(nxt) : undefined;
  const prev = ranks[ranks.findIndex((r) => r.id === rank.id) - 1];

  return (
    <PageShell>
      <div className="relative isolate overflow-hidden">
        <img
          src="/images/hero-boardroom.jpg"
          alt=""
          className="absolute inset-0 h-72 w-full object-cover opacity-30 sm:h-80"
        />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-bg/20 to-bg sm:h-80" />
        <div className="relative mx-auto max-w-4xl px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
          <Link
            to="/ladder"
            className="inline-flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
          >
            <ArrowLeft className="size-3.5" />
            The ladder
          </Link>
          <p className="mt-6 font-display text-6xl text-accent">{rank.roman}</p>
          <h1 className="mt-2 font-display text-5xl text-fg sm:text-6xl">{rank.title}</h1>
          <p className="mt-4 text-muted">
            {rank.years} · {rank.cumulative}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>Promotion {rank.promotionWindow}</Badge>
            <Badge>{rank.conversion}</Badge>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl space-y-12 px-5 pb-24 sm:px-8">
        <Reveal>
          <p className="font-display text-2xl italic text-fg sm:text-3xl">{rank.posture}</p>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-3xl text-fg">The work</h2>
          <ul className="mt-6 space-y-4">
            {rank.work.map((item) => (
              <li key={item} className="border-t border-border pt-4 text-muted">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-3xl text-fg">Time</h2>
          <div className="mt-6 space-y-3">
            {rank.timeSplit.map((slice) => (
              <div key={slice.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-fg">{slice.label}</span>
                  <span className="tabular-nums text-muted">{slice.pct}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${slice.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-3xl text-fg">Economics</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Megafunds", rank.cash.mega],
                ["Upper middle-market", rank.cash.umm],
                ["Core / LMM", rank.cash.core],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
                <p className="mt-2 font-display text-2xl tabular-nums text-fg">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">{rank.carry}</p>
        </Reveal>

        <Reveal>
          <blockquote className="border-l border-accent pl-5 font-display text-2xl italic text-fg">
            {rank.inflection}
          </blockquote>
        </Reveal>

        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-8">
          {prev ? (
            <Button variant="outline" asChild>
              <Link to="/ladder/$rank" params={{ rank: prev.id }}>
                <ArrowLeft className="size-4" />
                {prev.shortTitle}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild>
              <Link to="/ladder/$rank" params={{ rank: next.id }}>
                {next.shortTitle}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/performers">
                High performers
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </article>
    </PageShell>
  );
}
