import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Stat } from "@/components/desk/fields";
import { formatPct, formatUsd } from "@/lib/engines/lbo";
import { runCarry, type CarryInput } from "@/lib/engines/carry";
import { saveWork } from "@/lib/server/work";

const sample: CarryInput = {
  invested: 100,
  proceeds: 260,
  holdYears: 5,
  hurdle: 0.08,
  carryPct: 0.2,
  catchUp: true,
};

export function CarryPanel() {
  const [input, setInput] = useState<CarryInput>(sample);
  const [saving, setSaving] = useState(false);
  const result = useMemo(() => runCarry(input), [input]);

  async function persist() {
    setSaving(true);
    try {
      await saveWork({
        data: {
          kind: "carry",
          title: `Carry · GP ${formatUsd(result.gpTotal)} · ${formatPct(result.gpShareOfProfit)} of profit`,
          inputJson: JSON.stringify(input),
          outputJson: JSON.stringify(result),
        },
      });
      toast.success("Waterfall filed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not file");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Deal-level waterfall. Preferred compounds over the hold. Catch-up, if on, brings the GP to
        the carry rate on profit above the preferred before residual split.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          id="inv"
          label="Invested"
          suffix="$m"
          value={input.invested}
          onChange={(v) => setInput((p) => ({ ...p, invested: v }))}
        />
        <Field
          id="proc"
          label="Proceeds"
          suffix="$m"
          value={input.proceeds}
          onChange={(v) => setInput((p) => ({ ...p, proceeds: v }))}
        />
        <Field
          id="yrs"
          label="Hold"
          suffix="yrs"
          value={input.holdYears}
          onChange={(v) => setInput((p) => ({ ...p, holdYears: v }))}
        />
        <Field
          id="hurd"
          label="Hurdle"
          suffix="dec"
          step="0.01"
          value={input.hurdle}
          onChange={(v) => setInput((p) => ({ ...p, hurdle: v }))}
        />
        <Field
          id="cary"
          label="Carry"
          suffix="dec"
          step="0.01"
          value={input.carryPct}
          onChange={(v) => setInput((p) => ({ ...p, carryPct: v }))}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setInput((p) => ({ ...p, catchUp: !p.catchUp }))}
            className="h-11 w-full rounded-md bg-elevated text-[11px] uppercase tracking-[0.14em] text-muted hover:text-fg"
          >
            Catch-up {input.catchUp ? "on" : "off"}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Profit" value={formatUsd(result.profit)} />
        <Stat label="Preferred" value={formatUsd(result.preferred)} />
        <Stat label="GP total" value={formatUsd(result.gpTotal)} />
        <Stat label="GP of profit" value={formatPct(result.gpShareOfProfit)} />
      </div>
      <ul className="space-y-2 rounded-xl bg-elevated p-5 text-sm">
        <li className="flex justify-between">
          <span className="text-muted">LP capital returned</span>
          <span className="tabular-nums">{formatUsd(Math.min(input.invested, input.proceeds))}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted">GP catch-up</span>
          <span className="tabular-nums">{formatUsd(result.gpCatchUp)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted">GP promote</span>
          <span className="tabular-nums">{formatUsd(result.gpPromote)}</span>
        </li>
        <li className="flex justify-between border-t border-border pt-2">
          <span className="text-fg">LP total</span>
          <span className="tabular-nums text-fg">{formatUsd(result.lpTotal)}</span>
        </li>
      </ul>
      <p className="text-[11px] leading-relaxed text-subtle">
        Practice math on the figures you entered — a waterfall you can rebuild under a clock, not a
        carry ledger. Atrium keeps no capital accounts, runs no capital calls, and tracks no vesting
        or allocation. Anything a CFO signs comes off the fund's own books.
      </p>
      <Button type="button" onClick={() => void persist()} disabled={saving}>
        {saving ? "Filing…" : "File this waterfall"}
      </Button>
    </div>
  );
}
