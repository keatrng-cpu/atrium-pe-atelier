import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Stat } from "@/components/desk/fields";
import { saveWork } from "@/lib/server/work";
import { formatPct, formatUsd } from "@/lib/engines/lbo";
import { runDcf, sampleDcf, type DcfInput } from "@/lib/engines/dcf";
import { useState } from "react";

export function computedFromDcf(input: DcfInput) {
  const r = runDcf(input);
  return [
    `WACC ${formatPct(r.wacc, 2)} · ke ${formatPct(r.costEquity, 2)} · βL ${r.leveredBeta.toFixed(2)}`,
    `Explicit PV ${formatUsd(r.pvExplicit)} · Gordon TV ${formatUsd(r.tvGordon)} (PV ${formatUsd(r.pvGordon)}) · exit TV ${formatUsd(r.tvExit)} (PV ${formatUsd(r.pvExit)})`,
    `EV Gordon ${formatUsd(r.evGordon)} · EV exit ${formatUsd(r.evExit)} · mid ${formatUsd(r.evMid)}`,
    `Equity mid ${formatUsd(r.equityMid)} after net debt ${formatUsd(input.netDebt)}`,
  ].join("\n");
}

export function DcfPanel({
  onSendToCounsel,
}: {
  onSendToCounsel: (computed: string, prompt: string) => void;
}) {
  const [input, setInput] = useState<DcfInput>(sampleDcf);
  const result = useMemo(() => runDcf(input), [input]);
  const set = <K extends keyof DcfInput>(key: K, value: number) =>
    setInput((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        UFCF is EBIT×(1−t)+D&A−CapEx−ΔNWC. Terminal value is shown both ways. Nothing is invented.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="rev0" label="Year-0 revenue" suffix="$m" value={input.revenue0} onChange={(v) => set("revenue0", v)} />
        <Field id="gth" label="Revenue growth" suffix="dec" step="0.01" value={input.revGrowth} onChange={(v) => set("revGrowth", v)} />
        <Field id="em" label="EBIT margin" suffix="dec" step="0.01" value={input.ebitMargin} onChange={(v) => set("ebitMargin", v)} />
        <Field id="da" label="D&A / rev" suffix="dec" step="0.01" value={input.daPctRev} onChange={(v) => set("daPctRev", v)} />
        <Field id="cx" label="CapEx / rev" suffix="dec" step="0.01" value={input.capexPctRev} onChange={(v) => set("capexPctRev", v)} />
        <Field id="nwc" label="NWC / rev" suffix="dec" step="0.01" value={input.nwcPctRev} onChange={(v) => set("nwcPctRev", v)} />
        <Field id="tax" label="Tax" suffix="dec" step="0.01" value={input.tax} onChange={(v) => set("tax", v)} />
        <Field id="yrs" label="Years" suffix="n" step="1" value={input.years} onChange={(v) => set("years", v)} />
        <Field id="gg" label="Perpetuity g" suffix="dec" step="0.005" value={input.g} onChange={(v) => set("g", v)} />
        <Field id="ex" label="Exit multiple" suffix="x" value={input.exitMultiple} onChange={(v) => set("exitMultiple", v)} />
        <Field id="rf" label="Risk-free" suffix="dec" step="0.001" value={input.rf} onChange={(v) => set("rf", v)} />
        <Field id="erp" label="ERP" suffix="dec" step="0.001" value={input.erp} onChange={(v) => set("erp", v)} />
        <Field id="bu" label="Unlev. beta" step="0.01" value={input.unleveredBeta} onChange={(v) => set("unleveredBeta", v)} />
        <Field id="de" label="D/E" step="0.05" value={input.de} onChange={(v) => set("de", v)} />
        <Field id="kd" label="Cost of debt" suffix="dec" step="0.001" value={input.costDebt} onChange={(v) => set("costDebt", v)} />
        <Field id="nd" label="Net debt" suffix="$m" value={input.netDebt} onChange={(v) => set("netDebt", v)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="WACC" value={formatPct(result.wacc, 2)} />
        <Stat label="EV (mid)" value={formatUsd(result.evMid)} />
        <Stat label="Equity (mid)" value={formatUsd(result.equityMid)} />
        <Stat label="Gordon / exit" value={`${formatUsd(result.evGordon)} / ${formatUsd(result.evExit)}`} />
      </div>

      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.12em] text-subtle">
            <tr>
              <th className="py-2 font-normal">Year</th>
              <th className="py-2 font-normal">Revenue</th>
              <th className="py-2 font-normal">EBIT</th>
              <th className="py-2 font-normal">UFCF</th>
              <th className="py-2 font-normal">ΔNWC</th>
            </tr>
          </thead>
          <tbody>
            {result.years.map((y) => (
              <tr key={y.year} className="border-t border-border">
                <td className="py-2">{y.year}</td>
                <td className="py-2 tabular-nums">{formatUsd(y.revenue)}</td>
                <td className="py-2 tabular-nums">{formatUsd(y.ebit)}</td>
                <td className="py-2 tabular-nums">{formatUsd(y.ufcf)}</td>
                <td className="py-2 tabular-nums">{formatUsd(y.dnwc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-subtle">WACC × g (Gordon EV)</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {result.gridWaccGrowth.map((c) => (
            <div key={`${c.wacc}-${c.g}`} className="rounded-lg bg-elevated p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">
                {formatPct(c.wacc, 1)} · g {formatPct(c.g, 1)}
              </p>
              <p className="mt-1 font-display text-xl tabular-nums">{formatUsd(c.ev)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void saveWork({
              data: {
                kind: "dcf",
                title: `DCF · ${formatUsd(result.evMid)} EV · WACC ${formatPct(result.wacc, 2)}`,
                inputJson: JSON.stringify(input),
                outputJson: JSON.stringify(result),
              },
            })
              .then(() => toast.success("DCF filed."))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not file"))
          }
        >
          File the DCF
        </Button>
        <Button
          type="button"
          onClick={() =>
            onSendToCounsel(
              computedFromDcf(input),
              "Write the DCF exhibit: method, WACC build, both terminals, and what would move the range. Do not invent a number.",
            )
          }
        >
          Send to Counsel
        </Button>
      </div>
    </div>
  );
}
