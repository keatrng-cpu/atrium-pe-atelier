import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Stat } from "@/components/desk/fields";
import { saveWork } from "@/lib/server/work";
import { formatPct, formatUsd } from "@/lib/engines/lbo";
import { runMerger, sampleMerger, type MergerInput } from "@/lib/engines/merger";

export function computedFromMerger(input: MergerInput) {
  const r = runMerger(input);
  return [
    `Stand-alone EPS ${r.standAloneEps.toFixed(2)} · pro forma ${r.pfEps.toFixed(2)} · ${r.accretive ? "accretive" : "dilutive"} ${formatPct(r.accretion)}`,
    `Cash ${formatUsd(r.cashUsed)} · stock ${formatUsd(r.stockValue)} · new shares ${r.newShares.toFixed(1)}m · new debt ${formatUsd(r.newDebt)}`,
    `After-tax synergies ${formatUsd(r.afterTaxSynergies)} · after-tax interest ${formatUsd(r.afterTaxInterest)} · PF NI ${formatUsd(r.pfNi)}`,
  ].join("\n");
}

export function MergerPanel({
  onSendToCounsel,
}: {
  onSendToCounsel: (computed: string, prompt: string) => void;
}) {
  const [input, setInput] = useState<MergerInput>(sampleMerger);
  const result = useMemo(() => runMerger(input), [input]);
  const set = <K extends keyof MergerInput>(key: K, value: number) =>
    setInput((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Cash is new debt at the stated rate. Stock is new shares at the acquirer price. Synergies
        and interest are after tax.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="ani" label="Acquirer NI" suffix="$m" value={input.acqNi} onChange={(v) => set("acqNi", v)} />
        <Field id="ash" label="Acquirer shares" suffix="m" value={input.acqShares} onChange={(v) => set("acqShares", v)} />
        <Field id="apr" label="Acquirer price" suffix="$" value={input.acqPrice} onChange={(v) => set("acqPrice", v)} />
        <Field id="tni" label="Target NI" suffix="$m" value={input.tgtNi} onChange={(v) => set("tgtNi", v)} />
        <Field id="off" label="Offer equity" suffix="$m" value={input.offerEquity} onChange={(v) => set("offerEquity", v)} />
        <Field id="csh" label="Cash mix" suffix="dec" step="0.05" value={input.cashPct} onChange={(v) => set("cashPct", v)} />
        <Field id="syn" label="Synergies" suffix="$m" value={input.synergies} onChange={(v) => set("synergies", v)} />
        <Field id="tx" label="Tax" suffix="dec" step="0.01" value={input.tax} onChange={(v) => set("tax", v)} />
        <Field id="rt" label="Rate on new debt" suffix="dec" step="0.005" value={input.rate} onChange={(v) => set("rate", v)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Stand-alone EPS" value={result.standAloneEps.toFixed(2)} />
        <Stat label="Pro forma EPS" value={result.pfEps.toFixed(2)} />
        <Stat
          label={result.accretive ? "Accretion" : "Dilution"}
          value={formatPct(result.accretion)}
        />
        <Stat label="New shares" value={`${result.newShares.toFixed(1)}m`} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void saveWork({
              data: {
                kind: "merger",
                title: `Merger · ${result.accretive ? "accretive" : "dilutive"} ${formatPct(result.accretion)}`,
                inputJson: JSON.stringify(input),
                outputJson: JSON.stringify(result),
              },
            })
              .then(() => toast.success("Merger filed."))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not file"))
          }
        >
          File the merger
        </Button>
        <Button
          type="button"
          onClick={() =>
            onSendToCounsel(
              computedFromMerger(input),
              "Write the accretion/dilution exhibit. Name the drivers. Do not invent a number.",
            )
          }
        >
          Send to Counsel
        </Button>
      </div>
    </div>
  );
}
