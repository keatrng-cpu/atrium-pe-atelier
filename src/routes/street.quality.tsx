import { createFileRoute, Link } from "@tanstack/react-router";
import { StreetShell } from "@/components/street/street-shell";
import { multipleContext, qualityDimensions } from "@/lib/engines/quality";

export const Route = createFileRoute("/street/quality")({ component: QualityPage });

function QualityPage() {
  return (
    <StreetShell
      kicker="High value vs low value"
      title="Premiums are earned on durability, not adjectives."
      lede="High-value companies score on growth that lasts, cash that converts, and risk you can underwrite. Lower-value names are slower, thinner, more concentrated, or more cyclical. Multiples follow."
    >
      <div className="space-y-6">
        {qualityDimensions.map((d) => (
          <article key={d.id} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
            <h2 className="font-display text-3xl text-fg">{d.label}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-accent">High value</p>
                <p className="mt-2 text-sm text-fg">{d.high}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Lower value</p>
                <p className="mt-2 text-sm text-muted">{d.low}</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted">{d.impact}</p>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-fg">Multiple context · 2025–2026</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Ranges, not prints. Sector already embeds the tailwind. Do not double-count it in the DCF.
        </p>
        <ul className="mt-6 space-y-3">
          {multipleContext.map((row) => (
            <li key={row.book} className="flex flex-wrap justify-between gap-3 border-t border-border pt-3">
              <span className="text-fg">{row.book}</span>
              <span className="tabular-nums text-muted">{row.range}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm">
        <Link to="/desk" className="text-accent hover:text-fg">
          Score a live name on the desk
        </Link>
      </p>
    </StreetShell>
  );
}
