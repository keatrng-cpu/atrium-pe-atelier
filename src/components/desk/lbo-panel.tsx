import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Stat } from "@/components/desk/fields";
import { saveWork } from "@/lib/server/work";
import {
  formatPct,
  formatTurns,
  formatUsd,
  runPaperLbo,
  sampleLbo,
  type LboInput,
} from "@/lib/engines/lbo";

export function computedFromLbo(input: LboInput) {
  const r = runPaperLbo(input);
  return [
    `Entry EV ${formatUsd(r.entryEv)} (${formatTurns(input.entryMultiple)} on ${formatUsd(input.entryEbitda)} EBITDA)`,
    `Uses ${formatUsd(r.uses)} · sponsor equity ${formatUsd(r.sponsorEquity)} · leverage ${formatTurns(r.leverageTurns)}`,
    `Exit EBITDA ${formatUsd(r.exitEbitda)} · exit EV ${formatUsd(r.exitEv)} · exit net debt ${formatUsd(r.exitNetDebt)}`,
    `Exit equity ${formatUsd(r.exitEquity)} · MOIC ${r.moic.toFixed(2)}x · IRR ${formatPct(r.irr)}`,
    `Attribution — EBITDA growth ${formatUsd(r.attribution.ebitdaGrowth)}; multiple ${formatUsd(r.attribution.multipleExpansion)}; paydown ${formatUsd(r.attribution.debtPaydown)}; fees −${formatUsd(r.attribution.fees)}; residual ${formatUsd(r.attribution.checksum)}`,
  ].join("\n");
}

export function LboPanel({
  onSendToCounsel,
}: {
  onSendToCounsel: (computed: string, prompt: string) => void;
}) {
  const [input, setInput] = useState<LboInput>(sampleLbo);
  const [saving, setSaving] = useState(false);
  const result = useMemo(() => runPaperLbo(input), [input]);

  function set<K extends keyof LboInput>(key: K, value: number) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function persist() {
    setSaving(true);
    try {
      await saveWork({
        data: {
          kind: "lbo",
          title: `Paper LBO · ${formatTurns(result.moic)} MOIC · ${formatPct(result.irr)} IRR`,
          inputJson: JSON.stringify(input),
          outputJson: JSON.stringify(result),
        },
      });
      toast.success("LBO filed in the library.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not file");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        The engine computes every figure. Counsel may only narrate the COMPUTED block.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          id="ebitda"
          label="Entry EBITDA"
          suffix="$m"
          value={input.entryEbitda}
          onChange={(v) => set("entryEbitda", v)}
        />
        <Field
          id="emult"
          label="Entry multiple"
          suffix="x"
          value={input.entryMultiple}
          onChange={(v) => set("entryMultiple", v)}
        />
        <Field
          id="nd"
          label="Net debt"
          suffix="$m"
          value={input.netDebt}
          onChange={(v) => set("netDebt", v)}
        />
        <Field
          id="fees"
          label="Fees"
          suffix="$m"
          value={input.transactionFees}
          onChange={(v) => set("transactionFees", v)}
        />
        <Field
          id="cagr"
          label="EBITDA CAGR"
          suffix="dec"
          step="0.01"
          value={input.ebitdaCagr}
          onChange={(v) => set("ebitdaCagr", v)}
        />
        <Field
          id="hold"
          label="Hold"
          suffix="yrs"
          value={input.holdYears}
          onChange={(v) => set("holdYears", v)}
        />
        <Field
          id="xmult"
          label="Exit multiple"
          suffix="x"
          value={input.exitMultiple}
          onChange={(v) => set("exitMultiple", v)}
        />
        <Field
          id="sweep"
          label="Annual paydown"
          suffix="$m"
          value={input.annualDebtPaydown}
          onChange={(v) => set("annualDebtPaydown", v)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Entry EV" value={formatUsd(result.entryEv)} />
        <Stat label="Sponsor equity" value={formatUsd(result.sponsorEquity)} />
        <Stat label="MOIC" value={`${result.moic.toFixed(2)}x`} />
        <Stat label="IRR" value={formatPct(result.irr)} />
      </div>

      <div className="rounded-xl bg-elevated p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Attribution of equity value</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between gap-4">
            <span className="text-muted">EBITDA growth</span>
            <span className="tabular-nums text-fg">{formatUsd(result.attribution.ebitdaGrowth)}</span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-muted">Multiple expansion</span>
            <span className="tabular-nums text-fg">
              {formatUsd(result.attribution.multipleExpansion)}
            </span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-muted">Debt paydown</span>
            <span className="tabular-nums text-fg">{formatUsd(result.attribution.debtPaydown)}</span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-muted">Fees</span>
            <span className="tabular-nums text-fg">−{formatUsd(result.attribution.fees)}</span>
          </li>
          <li className="flex justify-between gap-4 border-t border-border pt-2">
            <span className="text-fg">Equity created</span>
            <span className="tabular-nums text-fg">{formatUsd(result.attribution.equityDelta)}</span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-subtle">Bridge residual</span>
            <span className="tabular-nums text-subtle">{formatUsd(result.attribution.checksum)}</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void persist()} disabled={saving}>
          {saving ? "Filing…" : "File this LBO"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onSendToCounsel(
              computedFromLbo(input),
              "Narrate this paper LBO as an IC exhibit. Quote only the COMPUTED figures. State what would make the return fragile.",
            )
          }
        >
          Ask counsel to narrate
        </Button>
        <Button type="button" variant="ghost" onClick={() => setInput(sampleLbo)}>
          Load sample
        </Button>
      </div>
    </div>
  );
}
