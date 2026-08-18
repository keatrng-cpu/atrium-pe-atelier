import { createFileRoute, Link } from "@tanstack/react-router";
import { StreetShell } from "@/components/street/street-shell";
import { streetDay, streetTasks, streetTime } from "@/data/street";

export const Route = createFileRoute("/street")({ component: StreetPage });

function StreetPage() {
  return (
    <StreetShell
      kicker="Investment banking"
      title="The analyst is the engine of the book."
      lede="Seventy to a hundred hours. Excel and slides. Models that must recompute at two in the morning. This is the seat most PE associates come from — and the work the desk now does."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {streetTime.map((t) => (
          <article key={t.label} className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="font-display text-4xl tabular-nums text-fg">{t.pct}%</p>
            <h2 className="mt-2 text-sm text-fg">{t.label}</h2>
            <p className="mt-2 text-sm text-muted">{t.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-fg">A typical day</h2>
        <ol className="mt-6 space-y-4">
          {streetDay.map((line, i) => (
            <li key={line} className="flex gap-4 border-t border-border pt-4">
              <span className="font-display text-2xl text-accent">{i + 1}</span>
              <p className="text-muted">{line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {streetTasks.map((t) => (
          <article key={t.title} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl text-fg">{t.title}</h2>
            <p className="mt-3 text-sm text-muted">{t.body}</p>
          </article>
        ))}
      </section>

      <p className="mt-12 text-sm text-muted">
        Open the desk for{" "}
        <Link to="/desk" className="text-accent hover:text-fg">
          comps, DCF, merger, and the quality score
        </Link>
        . The engines compute. Counsel only narrates.
      </p>
    </StreetShell>
  );
}
