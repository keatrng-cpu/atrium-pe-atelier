import type { RankId } from "@/data/ranks";

export type JobKind =
  | "lbo"
  | "attribution"
  | "carry"
  | "thesis"
  | "memo"
  | "diligence"
  | "kpi"
  | "sourcing"
  | "value"
  | "lp"
  | "counsel";

export type Job = {
  id: JobKind;
  title: string;
  ranks: RankId[];
  engine: "numbers" | "draft" | "both";
  brief: string;
  promptHint: string;
};

export const jobs: Job[] = [
  {
    id: "lbo",
    title: "Paper LBO",
    ranks: ["analyst", "senior-associate", "vice-president"],
    engine: "both",
    brief: "Sources & uses, cash sweep, exit equity, MOIC, IRR, and a clean attribution. Numbers are computed in the engine. Counsel only narrates them.",
    promptHint: "Narrate this LBO as an IC exhibit. Do not invent a number.",
  },
  {
    id: "attribution",
    title: "Returns attribution",
    ranks: ["analyst", "senior-associate", "vice-president", "principal"],
    engine: "numbers",
    brief: "Split equity creation into EBITDA growth, multiple expansion, and debt paydown. The residual must be fees, not folklore.",
    promptHint: "",
  },
  {
    id: "carry",
    title: "Carry waterfall",
    ranks: ["vice-president", "principal", "partner"],
    engine: "numbers",
    brief: "Preferred return, optional GP catch-up, and promote. Model timing, not just points.",
    promptHint: "",
  },
  {
    id: "thesis",
    title: "Independent thesis",
    ranks: ["analyst", "senior-associate", "vice-president", "principal"],
    engine: "draft",
    brief: "What would make this a good deal, and a bad one. Written before the CIM consensus becomes yours.",
    promptHint: "Write a one-page independent thesis. Separate facts from inference. End with a clear go / investigate / pass.",
  },
  {
    id: "memo",
    title: "IC memorandum",
    ranks: ["senior-associate", "vice-president", "principal", "partner"],
    engine: "draft",
    brief: "Investment committee prose: thesis, risks, returns, and the question the room must answer.",
    promptHint: "Draft an IC memo in the house style: short sentences, numbered risks, no adjectives that do not earn their keep.",
  },
  {
    id: "diligence",
    title: "Diligence module",
    ranks: ["analyst", "senior-associate", "vice-president"],
    engine: "draft",
    brief: "A workstream that surfaces real risk rather than confirming the thesis.",
    promptHint: "Build a diligence module with owners, questions that could kill the deal, and the evidence you would accept.",
  },
  {
    id: "kpi",
    title: "KPI / variance pack",
    ranks: ["analyst", "senior-associate", "vice-president", "principal"],
    engine: "draft",
    brief: "Monthly or quarterly pack a board can act on. Variance against the underwrite, not against last month’s story.",
    promptHint: "Write a board KPI pack: underwrite vs actual, three variances that matter, and the action you want from management.",
  },
  {
    id: "sourcing",
    title: "Sourcing brief",
    ranks: ["vice-president", "principal", "partner"],
    engine: "draft",
    brief: "Proprietary outreach: why this founder should take your call, and why now.",
    promptHint: "Write a sourcing brief and a ninety-word outreach note. No flattery. One reason this conversation is timely.",
  },
  {
    id: "value",
    title: "Value-creation plan",
    ranks: ["vice-president", "principal", "partner"],
    engine: "draft",
    brief: "Named initiatives with owners, dates, and dollars. Pricing, sales force, procurement, talent — not financial engineering.",
    promptHint: "Draft a 100-day and 24-month value-creation plan. Every initiative needs an owner, a date, and a dollar range.",
  },
  {
    id: "lp",
    title: "LP letter",
    ranks: ["principal", "partner"],
    engine: "draft",
    brief: "How an allocator actually reads a manager: consistency, team, alignment, realized track record.",
    promptHint: "Write an LP update. Marks are secondary to realizations. State the edge in ninety seconds of reading.",
  },
  {
    id: "counsel",
    title: "Open counsel",
    ranks: ["analyst", "senior-associate", "vice-president", "principal", "partner"],
    engine: "draft",
    brief: "A partner in the room. Ask about a live process, a model, a CEO, or a promotion decision.",
    promptHint: "",
  },
];

export function jobsForRank(rank: RankId) {
  return jobs.filter((job) => job.ranks.includes(rank));
}
