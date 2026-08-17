import { useState } from "react";
import { BriefBox } from "@/components/desk/fields";
import { Button } from "@/components/ui/button";
import type { Job } from "@/data/jobs";
import { diligenceChecks } from "@/data/diligence";
import { cn } from "@/lib/utils";

export function DraftPanel({
  job,
  brief,
  onBrief,
  onAsk,
  busy,
}: {
  job: Job;
  brief: string;
  onBrief: (v: string) => void;
  onAsk: () => void;
  busy: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">{job.brief}</p>
      {job.id === "diligence" ? (
        <div className="space-y-5 rounded-xl bg-elevated p-5">
          {diligenceChecks.map((group) => (
            <div key={group.id}>
              <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => {
                  const key = `${group.id}:${item}`;
                  const on = Boolean(checked[key]);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setChecked((p) => ({ ...p, [key]: !p[key] }))}
                        className={cn(
                          "flex w-full min-h-11 items-start gap-3 text-left text-sm",
                          on ? "text-fg" : "text-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1 size-3 shrink-0 rounded-sm border",
                            on ? "border-accent bg-accent" : "border-border-strong",
                          )}
                        />
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      <BriefBox
        value={brief}
        onChange={onBrief}
        placeholder={
          job.id === "thesis"
            ? "Paste the CIM excerpt, or describe the company, sector, entry multiple, and what the banker is selling."
            : job.id === "kpi"
              ? "Underwrite vs actual: revenue, EBITDA, cash, and the three variances you cannot explain yet."
              : job.id === "sourcing"
                ? "Founder, sector, why this relationship exists, and why the conversation is timely."
                : "Give Counsel the facts. It will not invent the rest."
        }
      />
      <Button type="button" onClick={onAsk} disabled={busy || brief.trim().length < 8}>
        {busy ? "Counsel is writing…" : `Ask counsel — ${job.title.toLowerCase()}`}
      </Button>
    </div>
  );
}
