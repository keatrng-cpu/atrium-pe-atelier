import { Link } from "@tanstack/react-router";
import { TapeChart } from "@/components/research/tape-chart";
import type { ResearchBrief } from "@/lib/server/research";
import { cn } from "@/lib/utils";

function pct(v: number | null) {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v * 100).toFixed(1)}%`;
}

export function BriefView({ brief }: { brief: ResearchBrief }) {
  const { body, review, market } = brief;
  return (
    <article className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
          {brief.kind} · {body.asOf} · {review.grade} · {review.confidence} confidence
        </p>
        <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">{body.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{body.verdict}</p>
        {brief.status === "published" ? (
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-subtle">Published</p>
        ) : (
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-subtle">
            Reviewed — not yet circulated
          </p>
        )}
      </header>

      <section
        className={cn(
          "rounded-2xl p-6 sm:p-8",
          review.grade === "pass"
            ? "bg-surface"
            : "bg-surface shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-danger)_35%,transparent)]",
        )}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Second-partner review</p>
        <p className="mt-3 text-sm text-fg">{review.notes}</p>
        {review.flags.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {review.flags.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
        ) : null}
        {review.unsupported.length > 0 ? (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Unsupported</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {review.unsupported.map((u) => (
                <li key={u}>· {u}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {market ? (
        <section className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Computed tape</p>
          <h2 className="mt-2 font-display text-3xl text-fg">
            {market.ticker} · {market.name}
          </h2>
          <p className="mt-1 text-sm text-subtle">
            Calculated from public daily prints. The model does not invent these figures.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TapeStat label="Last" value={`${market.last.toFixed(2)} ${market.currency}`} />
            <TapeStat label="Session" value={pct(market.changePct)} />
            <TapeStat label="1y" value={pct(market.ret1y)} />
            <TapeStat
              label="Market cap"
              value={
                market.marketCap != null
                  ? market.marketCap >= 1e9
                    ? `${(market.marketCap / 1e9).toFixed(1)}bn`
                    : `${(market.marketCap / 1e6).toFixed(0)}m`
                  : "—"
              }
            />
          </div>
          <div className="mt-4">
            <TapeChart market={market} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-3xl text-fg">Thesis</h2>
        <p className="mt-3 max-w-2xl text-muted">{body.thesis}</p>
      </section>

      {body.facts.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl text-fg">What is backed</h2>
          <ol className="mt-5 space-y-4">
            {body.facts.map((f, i) => (
              <li key={i} className="border-t border-border pt-4">
                <p className="text-fg">{f.claim}</p>
                {f.whyItMatters ? <p className="mt-1 text-sm text-muted">{f.whyItMatters}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {body.risks.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl text-fg">Risks that matter</h2>
          <ul className="mt-4 space-y-2 text-muted">
            {body.risks.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {body.body ? (
        <section className="max-w-2xl whitespace-pre-wrap font-serif text-[17px] leading-relaxed text-fg">
          {body.body}
        </section>
      ) : null}

      {body.implications ? (
        <section>
          <h2 className="font-display text-3xl text-fg">Implications</h2>
          <p className="mt-3 max-w-2xl text-muted">{body.implications}</p>
        </section>
      ) : null}

      {body.openQuestions.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl text-fg">Still open</h2>
          <ul className="mt-4 space-y-2 text-muted">
            {body.openQuestions.map((q) => (
              <li key={q}>· {q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-3xl text-fg">Sources</h2>
        {brief.citations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No URLs were returned with this sitting.</p>
        ) : (
          <ol className="mt-5 space-y-2">
            {brief.citations.map((url, i) => (
              <li key={url} className="text-sm">
                <span className="text-subtle">{i + 1}. </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-accent underline-offset-4 hover:underline"
                >
                  {url.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-sm text-subtle">
        <Link to="/research" className="text-accent hover:text-fg">
          Back to the desk
        </Link>
      </p>
    </article>
  );
}

function TapeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-elevated p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums text-fg">{value}</p>
    </div>
  );
}
