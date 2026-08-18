import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Stat } from "@/components/desk/fields";
import { Input } from "@/components/ui/input";
import { saveWork } from "@/lib/server/work";
import { formatTurns, formatUsd } from "@/lib/engines/lbo";
import {
  bookFromPeers,
  implyFromStats,
  samplePeers,
  samplePrecedents,
  sampleTarget,
  spreadPrecedent,
  type CompRow,
  type PrecedentRow,
  type TargetMetrics,
} from "@/lib/engines/comps";

function stat(v: number | null) {
  return v == null ? "—" : formatTurns(v);
}

export function computedFromComps(peers: CompRow[], target: TargetMetrics, deals: PrecedentRow[]) {
  const book = bookFromPeers(peers);
  const implied = implyFromStats(target, book);
  const prec = deals.map(spreadPrecedent);
  const precMed = bookFromPeers(peers).evEbitda; // placeholder unused
  void precMed;
  const precEvs = prec.map((p) => p.evEbitda).filter((v): v is number => v != null);
  const precLine =
    precEvs.length > 0
      ? `Precedent EV/EBITDA n=${precEvs.length} median ${formatTurns(
          [...precEvs].sort((a, b) => a - b)[Math.floor((precEvs.length - 1) / 2)],
        )}`
      : "No precedents spread.";
  return [
    `Trading comps n=${book.evEbitda.n}. Median EV/EBITDA ${stat(book.evEbitda.median)} · p25 ${stat(book.evEbitda.p25)} · p75 ${stat(book.evEbitda.p75)}.`,
    ...implied.map(
      (r) =>
        `${r.metric} ${stat(r.multiple)} → EV ${r.impliedEv != null ? formatUsd(r.impliedEv) : "—"} · equity ${r.impliedEquity != null ? formatUsd(r.impliedEquity) : "—"}`,
    ),
    precLine,
  ].join("\n");
}

export function CompsPanel({
  onSendToCounsel,
}: {
  onSendToCounsel: (computed: string, prompt: string) => void;
}) {
  const [peers, setPeers] = useState<CompRow[]>(samplePeers);
  const [target, setTarget] = useState<TargetMetrics>(sampleTarget);
  const [deals, setDeals] = useState<PrecedentRow[]>(samplePrecedents);
  const book = useMemo(() => bookFromPeers(peers), [peers]);
  const implied = useMemo(() => implyFromStats(target, book), [target, book]);

  function setPeer(i: number, patch: Partial<CompRow>) {
    setPeers((prev) => prev.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Illustrative names. Replace every figure with a filing. The engine only multiplies what you
        type.
      </p>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Target</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Field id="tr" label="LTM revenue" suffix="$m" value={target.ltmRev} onChange={(v) => setTarget((p) => ({ ...p, ltmRev: v }))} />
          <Field id="te" label="LTM EBITDA" suffix="$m" value={target.ltmEbitda} onChange={(v) => setTarget((p) => ({ ...p, ltmEbitda: v }))} />
          <Field id="tb" label="LTM EBIT" suffix="$m" value={target.ltmEbit} onChange={(v) => setTarget((p) => ({ ...p, ltmEbit: v }))} />
          <Field id="tn" label="LTM NI" suffix="$m" value={target.ltmNi} onChange={(v) => setTarget((p) => ({ ...p, ltmNi: v }))} />
          <Field id="tf" label="NTM EBITDA" suffix="$m" value={target.ntmEbitda} onChange={(v) => setTarget((p) => ({ ...p, ntmEbitda: v }))} />
          <Field id="td" label="Net debt" suffix="$m" value={target.netDebt} onChange={(v) => setTarget((p) => ({ ...p, netDebt: v }))} />
        </div>
      </div>

      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.12em] text-subtle">
            <tr>
              <th className="py-2 font-normal">Peer</th>
              <th className="py-2 font-normal">Price</th>
              <th className="py-2 font-normal">Shares</th>
              <th className="py-2 font-normal">Net debt</th>
              <th className="py-2 font-normal">EBITDA</th>
              <th className="py-2 font-normal">EV</th>
              <th className="py-2 font-normal">EV/EBITDA</th>
              <th className="py-2 font-normal">EV/Rev</th>
            </tr>
          </thead>
          <tbody>
            {book.spreads.map((row, i) => (
              <tr key={row.peer.name} className="border-t border-border">
                <td className="py-2 pr-2">
                  <Input value={row.peer.name} onChange={(e) => setPeer(i, { name: e.target.value })} />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="tabular-nums"
                    value={row.peer.price}
                    onChange={(e) => setPeer(i, { price: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="tabular-nums"
                    value={row.peer.dilutedShares}
                    onChange={(e) => setPeer(i, { dilutedShares: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="tabular-nums"
                    value={row.peer.netDebt}
                    onChange={(e) => setPeer(i, { netDebt: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    className="tabular-nums"
                    value={row.peer.ltmEbitda}
                    onChange={(e) => setPeer(i, { ltmEbitda: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 tabular-nums text-fg">{formatUsd(row.spread.ev)}</td>
                <td className="py-2 tabular-nums text-fg">{stat(row.spread.evEbitda)}</td>
                <td className="py-2 tabular-nums text-fg">{stat(row.spread.evRev)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Median EV/EBITDA" value={stat(book.evEbitda.median)} />
        <Stat label="25th" value={stat(book.evEbitda.p25)} />
        <Stat label="75th" value={stat(book.evEbitda.p75)} />
        <Stat label="Median EV/Rev" value={stat(book.evRev.median)} />
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Implied value of the target</h3>
        <ul className="mt-3 space-y-2">
          {implied.map((r) => (
            <li key={r.metric} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2 text-sm">
              <span className="text-muted">{r.metric}</span>
              <span className="tabular-nums text-fg">
                {stat(r.multiple)} · EV {r.impliedEv != null ? formatUsd(r.impliedEv) : "—"} · eq{" "}
                {r.impliedEquity != null ? formatUsd(r.impliedEquity) : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">Precedents</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {deals.map((d, i) => {
            const s = spreadPrecedent(d);
            return (
              <li key={d.name} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2">
                <span className="text-fg">
                  {d.name} · {d.year} · {d.buyer}
                </span>
                <span className="tabular-nums text-muted">
                  EV {formatUsd(d.ev)} · {stat(s.evEbitda)} · prem {(d.premium * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.12em] text-subtle"
                  onClick={() => setDeals((prev) => prev.filter((_, n) => n !== i))}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void saveWork({
              data: {
                kind: "comps",
                title: `Comps · median ${stat(book.evEbitda.median)} EV/EBITDA`,
                inputJson: JSON.stringify({ peers, target, deals }),
                outputJson: JSON.stringify({ book, implied }),
              },
            })
              .then(() => toast.success("Spread filed."))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not file"));
          }}
        >
          File the spread
        </Button>
        <Button
          type="button"
          onClick={() =>
            onSendToCounsel(
              computedFromComps(peers, target, deals),
              "Narrate this trading-and-precedent book as a soccer-field exhibit. Do not invent a number.",
            )
          }
        >
          Send to Counsel
        </Button>
      </div>
    </div>
  );
}
