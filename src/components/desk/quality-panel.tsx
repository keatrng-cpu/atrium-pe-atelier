import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/desk/fields";
import { saveWork } from "@/lib/server/work";
import {
  qualityDimensions,
  sampleQuality,
  scoreQuality,
  type QualityScores,
} from "@/lib/engines/quality";
import { cn } from "@/lib/utils";

export function computedFromQuality(scores: QualityScores) {
  const s = scoreQuality(scores);
  const lines = qualityDimensions.map(
    (d) => `${d.label}: ${scores[d.id]}/5 — ${scores[d.id] >= 4 ? d.high : scores[d.id] <= 2 ? d.low : "mixed"}`,
  );
  return [`Quality mean ${s.mean.toFixed(2)} / 5 · ${s.label} multiple.`, ...lines].join("\n");
}

export function QualityPanel({
  onSendToCounsel,
}: {
  onSendToCounsel: (computed: string, prompt: string) => void;
}) {
  const [scores, setScores] = useState<QualityScores>(sampleQuality);
  const result = useMemo(() => scoreQuality(scores), [scores]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Score the company the way a book would. High scores justify a premium to the sector median.
        The mean is a label, not a price.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Mean" value={result.mean.toFixed(2)} />
        <Stat label="Book" value={result.label} />
        <Stat label="Dimensions" value={String(qualityDimensions.length)} />
      </div>
      <ul className="space-y-4">
        {qualityDimensions.map((d) => (
          <li key={d.id} className="rounded-xl bg-elevated p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-fg">{d.label}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{scores[d.id]} / 5</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScores((p) => ({ ...p, [d.id]: n }))}
                  className={cn(
                    "size-10 rounded-full text-sm",
                    scores[d.id] === n ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">{scores[d.id] >= 4 ? d.high : scores[d.id] <= 2 ? d.low : d.impact}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void saveWork({
              data: {
                kind: "quality",
                title: `Quality · ${result.label} · ${result.mean.toFixed(2)}`,
                inputJson: JSON.stringify(scores),
                outputJson: JSON.stringify(result),
              },
            })
              .then(() => toast.success("Score filed."))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not file"))
          }
        >
          File the score
        </Button>
        <Button
          type="button"
          onClick={() =>
            onSendToCounsel(
              computedFromQuality(scores),
              "Write the quality exhibit: why this name deserves a premium, an in-line, or a discount. Tie each claim to the score. Do not invent a multiple.",
            )
          }
        >
          Send to Counsel
        </Button>
      </div>
    </div>
  );
}
