import { createFileRoute, Link } from "@tanstack/react-router";
import { StreetShell } from "@/components/street/street-shell";
import { sellingPoints } from "@/data/street";

export const Route = createFileRoute("/street/highlights")({ component: HighlightsPage });

function HighlightsPage() {
  return (
    <StreetShell
      kicker="Investment highlights"
      title="A buyer commits to a short list of claims that are true."
      lede="The CIM and the pitch crystallize a handful of points. Each one is data-backed. Vague adjectives do not raise a book."
    >
      <ol className="space-y-6">
        {sellingPoints.map((p, i) => (
          <li key={p.title} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
            <p className="font-display text-4xl text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-3 font-display text-3xl text-fg">{p.title}</h2>
            <p className="mt-3 max-w-2xl text-muted">{p.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-sm text-muted">
        Counsel can draft highlights only from a COMPUTED comps or DCF block.{" "}
        <Link to="/desk" className="text-accent hover:text-fg">
          Open the desk
        </Link>
        .
      </p>
    </StreetShell>
  );
}
