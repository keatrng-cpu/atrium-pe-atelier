import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { CompChart } from "@/components/comp-chart";
import { Badge } from "@/components/ui/badge";
import { firmTiers, ranks, type FirmTier } from "@/data/ranks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ladder")({ component: LadderPage });

function LadderPage() {
  const [tier, setTier] = useState<FirmTier>("mega");

  return (
    <PageShell>
      <PageIntro
        kicker="The typical ladder"
        title="Responsibilities, time, and economics."
        lede="From the first model to the last fundraise. Compensation figures are all-in cash — base plus bonus — for 2025–2026 in major US markets. Ranges move with firm size."
      />

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <Reveal>
          <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl text-fg">Cash by seat</h2>
              <div className="flex flex-wrap gap-2">
                {firmTiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={cn(
                      "h-10 rounded-full px-4 text-[11px] uppercase tracking-[0.14em] transition-colors duration-150",
                      tier === t.id
                        ? "bg-accent text-accent-fg"
                        : "bg-elevated text-muted hover:text-fg",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-subtle">{firmTiers.find((t) => t.id === tier)?.note}</p>
            <div className="mt-6">
              <CompChart tier={tier} />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-5 pb-24 sm:px-8">
        {ranks.map((rank, i) => (
          <Reveal key={rank.id} delay={i * 40}>
            <article className="grid gap-6 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8 lg:grid-cols-[8rem_1fr_16rem]">
              <div>
                <p className="font-display text-5xl text-accent">{rank.roman}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-subtle">
                  {rank.years}
                </p>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-3xl text-fg">{rank.title}</h2>
                  <Badge>{rank.promotionWindow}</Badge>
                </div>
                <p className="mt-3 text-muted">{rank.posture}</p>
                <ul className="mt-5 space-y-2 text-sm text-fg/90">
                  {rank.work.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/ladder/$rank"
                  params={{ rank: rank.id }}
                  className="mt-5 inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.16em] text-accent hover:text-fg"
                >
                  Full seat brief
                </Link>
              </div>
              <div className="rounded-xl bg-elevated p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
                  All-in cash · {firmTiers.find((t) => t.id === tier)?.label}
                </p>
                <p className="mt-2 font-display text-3xl tabular-nums text-fg">{rank.cash[tier]}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-subtle">Carry</p>
                <p className="mt-1 text-sm text-muted">{rank.carry}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-subtle">
                  Promotion conversion
                </p>
                <p className="mt-1 text-sm text-muted">{rank.conversion}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
    </PageShell>
  );
}
