import { createFileRoute, Link } from "@tanstack/react-router";
import { StreetShell } from "@/components/street/street-shell";
import { dcfPoints, denominators, evBuild } from "@/data/street";

export const Route = createFileRoute("/street/spread")({ component: SpreadPage });

function SpreadPage() {
  return (
    <StreetShell
      kicker="Data points"
      title="Every multiple starts with a number you can defend."
      lede="Analysts triangulate. Trading comps, precedents, DCF — never one method. You spread filings into a book, normalize one-times, and only then apply a median."
    >
      <section>
        <h2 className="font-display text-3xl text-fg">Equity value and enterprise value</h2>
        <ul className="mt-6 space-y-4">
          {evBuild.map((row) => (
            <li key={row.term} className="border-t border-border pt-4">
              <p className="text-fg">{row.term}</p>
              <p className="mt-1 text-sm text-muted">{row.how}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-fg">The denominators</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          LTM is actual trailing, calendarized if fiscal years differ. NTM is consensus. Adjust for
          one-times so the figure is operating, not reported.
        </p>
        <ul className="mt-6 space-y-4">
          {denominators.map((row) => (
            <li key={row.term} className="border-t border-border pt-4">
              <p className="text-fg">{row.term}</p>
              <p className="mt-1 text-sm text-muted">{row.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-fg">DCF inputs</h2>
        <p className="mt-3 max-w-2xl font-serif text-xl text-fg">
          UFCF = EBIT × (1 − t) + D&A − CapEx − ΔNWC
        </p>
        <ul className="mt-6 space-y-4">
          {dcfPoints.map((row) => (
            <li key={row.term} className="border-t border-border pt-4">
              <p className="text-fg">{row.term}</p>
              <p className="mt-1 text-sm text-muted">{row.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
        <h2 className="font-display text-3xl text-fg">Precedents sit higher</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Offer price × diluted shares, plus the target’s net debt at announcement. Premiums to the
          undisturbed price are typically 20–40%. The multiple embeds control. Do not compare it
          naïvely to a trading print.
        </p>
        <p className="mt-6 text-sm">
          <Link to="/desk" className="text-accent hover:text-fg">
            Spread a live book on the desk
          </Link>
        </p>
      </section>
    </StreetShell>
  );
}
