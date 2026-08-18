export const qualityDimensions = [
  {
    id: "growth",
    label: "Revenue growth",
    high: "Double-digit organic, sustainable, with named drivers.",
    low: "Low single-digit or declining; cyclical or one-time spikes.",
    impact: "The strongest multiple driver. High-growth software can print 15–30x EBITDA; mature industrials 7–12x.",
  },
  {
    id: "visibility",
    label: "Revenue quality",
    high: "Recurring (subscriptions, long contracts >70–80%), low churn, diversified customers.",
    low: "Transactional, project-based, one client >15–20%, high churn.",
    impact: "Recurring revenue can add 40–60%+ to the multiple inside a sector.",
  },
  {
    id: "margins",
    label: "Margins & profitability",
    high: "High and expanding EBITDA (25–40%+ software; >20% elsewhere); pricing power in gross margin.",
    low: "Thin or compressed (10–15%); declining or volatile.",
    impact: "Signals a moat and operating leverage. Premiums follow.",
  },
  {
    id: "roic",
    label: "Returns on capital",
    high: "ROIC >15%, often 20%+, consistently above WACC.",
    low: "ROIC <8–10%; value-destructive.",
    impact: "High ROIC compounds and supports a higher terminal multiple.",
  },
  {
    id: "cash",
    label: "Cash conversion",
    high: "UFCF / EBITDA or NI often >50–70%; low CapEx intensity.",
    low: "Heavy working capital or maintenance CapEx; FCF lags earnings.",
    impact: "Better cash reduces risk and raises LBO capacity.",
  },
  {
    id: "position",
    label: "Scale & position",
    high: "Clear #1/#2 with a moat — IP, network, brand, switching costs, scale.",
    low: "Follower, fragmented, easy to copy, or facing disruption.",
    impact: "Leaders take a premium. Scarcity lifts strategic bids.",
  },
  {
    id: "risk",
    label: "Risk profile",
    high: "Low cyclicality, diversified end-markets, ND/EBITDA <2–3x, stable beta.",
    low: "Cyclical, concentrated, levered, execution risk.",
    impact: "Lower risk is a lower WACC and a higher multiple.",
  },
  {
    id: "management",
    label: "Management & execution",
    high: "Delivery track record, aligned ownership, a plan you would underwrite.",
    low: "Unproven, turnover, weak governance.",
    impact: "Directly taxes the credibility of every projection.",
  },
  {
    id: "tailwind",
    label: "Industry tailwinds",
    high: "Secular (software adoption, demographics, electrification).",
    low: "Mature, declining, regulated, or commoditized.",
    impact: "Already in the sector multiple. Do not double-count.",
  },
] as const;

export type QualityScores = Record<(typeof qualityDimensions)[number]["id"], number>;

export const sampleQuality: QualityScores = {
  growth: 4,
  visibility: 3,
  margins: 4,
  roic: 3,
  cash: 3,
  position: 4,
  risk: 3,
  management: 4,
  tailwind: 3,
};

export function scoreQuality(scores: QualityScores) {
  const ids = qualityDimensions.map((d) => d.id);
  const values = ids.map((id) => {
    const v = scores[id];
    return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 3;
  });
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const label = mean >= 4 ? "premium" : mean >= 3 ? "in-line" : "discount";
  return { mean, label, values };
}

export const multipleContext = [
  { book: "High-growth SaaS with Rule-of-40", range: "15–30x+ EV/EBITDA (or high EV/Revenue)" },
  { book: "Healthcare services / medtech", range: "12–22x" },
  { book: "Specialty industrials / recurring services", range: "10–14x" },
  { book: "Mature manufacturing, distribution, energy", range: "5–9x" },
  { book: "Lower-middle-market private vs public large-cap", range: "Private software often ~8x where public prints far higher" },
];
