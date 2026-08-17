import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { dimensions, partnerSelectors } from "@/data/performers";

export const Route = createFileRoute("/performers")({ component: PerformersPage });

function PerformersPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="What separates high performers"
        title="Six dimensions after table stakes."
        lede="Technical excellence gets you in the door and through the associate years. Thereafter it is assumed. The people who remain distinguish themselves here."
      />

      <section className="mx-auto max-w-6xl space-y-6 px-5 pb-16 sm:px-8">
        {dimensions.map((d, i) => (
          <Reveal key={d.id} delay={i * 40}>
            <article className="grid gap-6 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8 lg:grid-cols-[6rem_1fr]">
              <p className="font-display text-4xl text-accent">{d.numeral}</p>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">{d.when}</p>
                <h2 className="mt-2 font-display text-3xl text-fg">{d.title}</h2>
                <p className="mt-4 max-w-3xl text-muted">{d.body}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {d.signals.map((s) => (
                    <li key={s} className="flex gap-3 text-sm text-fg/90">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl text-fg">When the partnership chooses</h2>
            <p className="mt-3 text-muted">
              Additional differentiators that appear in partner selection, after the six.
            </p>
            <ol className="mt-8 space-y-4">
              {partnerSelectors.map((item, i) => (
                <li key={item} className="flex gap-4 border-t border-border pt-4">
                  <span className="font-display text-xl text-accent">0{i + 1}</span>
                  <p className="text-fg">{item}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <Button asChild>
                <Link to="/mastery">Open the mastery plan</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
