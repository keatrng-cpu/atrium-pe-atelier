export type FirmTier = "mega" | "umm" | "core";

export type RankId =
  | "analyst"
  | "senior-associate"
  | "vice-president"
  | "principal"
  | "partner";

export type Rank = {
  id: RankId;
  roman: string;
  title: string;
  shortTitle: string;
  years: string;
  cumulative: string;
  conversion: string;
  promotionWindow: string;
  cash: Record<FirmTier, string>;
  cashBand: Record<FirmTier, [number, number]>;
  carry: string;
  timeSplit: { label: string; pct: number }[];
  posture: string;
  work: string[];
  inflection: string;
};

export const firmTiers: { id: FirmTier; label: string; note: string }[] = [
  {
    id: "mega",
    label: "Megafunds",
    note: "Blackstone, KKR, Apollo and peers. Higher cash, larger deals, steeper pyramid.",
  },
  {
    id: "umm",
    label: "Upper middle-market",
    note: "Earlier ownership, more deal repetitions, better visibility of your contribution.",
  },
  {
    id: "core",
    label: "Core / lower middle-market",
    note: "Broader seats, sometimes earlier carry, culture varies more by firm than by size.",
  },
];

export const ranks: Rank[] = [
  {
    id: "analyst",
    roman: "I",
    title: "Analyst / Associate",
    shortTitle: "Associate",
    years: "0–4 years",
    cumulative: "Often after two years of investment banking",
    conversion: "~70% to Senior Associate",
    promotionWindow: "2–3 years",
    cash: {
      mega: "$325k–$450k",
      umm: "$275k–$400k",
      core: "$200k–$350k",
    },
    cashBand: {
      mega: [325, 450],
      umm: [275, 400],
      core: [200, 350],
    },
    carry: "Rare or token — 0–0.5 points. Co-invest rights sometimes appear.",
    timeSplit: [
      { label: "Modeling", pct: 60 },
      { label: "Diligence", pct: 20 },
      { label: "Research", pct: 20 },
    ],
    posture:
      "Execution support. You sit in management meetings but rarely lead them. The work is heavily technical.",
    work: [
      "Own full three-statement models, LBOs from a blank sheet, sensitivity and scenario analysis, and returns attribution.",
      "Prepare investment committee memos — clean narrative, tight exhibits, no orphaned numbers.",
      "Support diligence: coordinate accountants, consultants, counsel, and commercial diligence firms.",
      "Build industry research packs and keep the deal pipeline current.",
      "Portfolio monitoring: monthly and quarterly KPI packs, variance analysis against the underwrite.",
    ],
    inflection:
      "Technical excellence gets you through this door. Speed without sloppiness is the entire game.",
  },
  {
    id: "senior-associate",
    roman: "II",
    title: "Senior Associate",
    shortTitle: "Senior Associate",
    years: "3–6 years",
    cumulative: "Cumulative in PE",
    conversion: "~60% to Vice President",
    promotionWindow: "1–2 years",
    cash: {
      mega: "$375k–$525k",
      umm: "$325k–$475k",
      core: "$300k–$425k",
    },
    cashBand: {
      mega: [375, 525],
      umm: [325, 475],
      core: [300, 425],
    },
    carry: "Small grants may begin — 0–2 points.",
    timeSplit: [
      { label: "Workstream ownership", pct: 40 },
      { label: "Modeling & memo", pct: 30 },
      { label: "People & advisers", pct: 30 },
    ],
    posture:
      "You take ownership of discrete workstreams, begin managing juniors, and speak more directly with management and advisers.",
    work: [
      "Own a full diligence module or a section of the investment memo without being chased.",
      "Manage junior analysts and associates — quality control becomes your reputation.",
      "Interact directly with management teams and external advisers.",
      "Refine models independently; the partner should not be finding formula errors.",
      "Contribute to the investment thesis, not only the exhibits that support someone else’s.",
      "First meaningful exposure to portfolio company board materials and operational tracking.",
    ],
    inflection:
      "This is where commercial instinct starts to be scored. A clean model is assumed. A point of view is not.",
  },
  {
    id: "vice-president",
    roman: "III",
    title: "Vice President",
    shortTitle: "Vice President",
    years: "5–9 years",
    cumulative: "The critical inflection",
    conversion: "~50% to Principal",
    promotionWindow: "2–4 years",
    cash: {
      mega: "$550k–$800k",
      umm: "$450k–$650k",
      core: "$400k–$575k",
    },
    cashBand: {
      mega: [550, 800],
      umm: [450, 650],
      core: [400, 575],
    },
    carry: "Meaningful — typically 0.5–3 points. Value starts to matter on successful funds.",
    timeSplit: [
      { label: "Deal quarterback", pct: 45 },
      { label: "Sourcing", pct: 25 },
      { label: "Portfolio & IC", pct: 30 },
    ],
    posture:
      "Day-to-day quarterback of deals. You must show commercial judgment and the ability to manage CEOs without overstepping.",
    work: [
      "Lead execution end-to-end under partner supervision.",
      "Manage external advisers and negotiate key terms.",
      "Begin independent sourcing — proprietary outreach and banker relationships.",
      "Own parts of portfolio monitoring and value-creation tracking.",
      "Attend or present at investment committee.",
      "Demonstrate that you can hold a room with a founder-CEO without performing partnership too early.",
    ],
    inflection:
      "Technical skill alone rarely suffices past this seat. Sponsorship, judgment, and a personal pipeline become the scorecard.",
  },
  {
    id: "principal",
    roman: "IV",
    title: "Principal / Director",
    shortTitle: "Principal",
    years: "8–12 years",
    cumulative: "Origination becomes a core metric",
    conversion: "~30–40% to Partner",
    promotionWindow: "3–5 years",
    cash: {
      mega: "$800k–$1.5M",
      umm: "$600k–$1.1M",
      core: "$500k–$900k",
    },
    cashBand: {
      mega: [800, 1500],
      umm: [600, 1100],
      core: [500, 900],
    },
    carry: "Expands significantly — often 1–5+ points.",
    timeSplit: [
      { label: "Sourcing & leading deals", pct: 40 },
      { label: "Boards & value creation", pct: 35 },
      { label: "IC, LPs, mentoring", pct: 25 },
    ],
    posture:
      "You lead deals from sourcing through close, sit on boards, and carry real weight in investment committee.",
    work: [
      "Originate and lead transactions through close.",
      "Sit on portfolio company boards and drive value-creation plans with management.",
      "Mentor juniors with the same precision you once demanded of yourself.",
      "Contribute to fundraising conversations and LP updates.",
      "Investment judgment is scrutinized: picking winners, and walking away from popular but flawed deals.",
      "Measurable portfolio impact — not paper marks — is the currency.",
    ],
    inflection:
      "Partner selection looks for internal sponsorship, consistency of realized exits, fundraising contribution, and cultural alignment.",
  },
  {
    id: "partner",
    roman: "V",
    title: "Partner / Managing Director",
    shortTitle: "Partner",
    years: "12+ years",
    cumulative: "You own firm-level outcomes",
    conversion: "The seat, not a window",
    promotionWindow: "Held, not granted on a clock",
    cash: {
      mega: "$1.5M–$3M+",
      umm: "$1.1M–$2.2M",
      core: "$1.0M–$1.8M",
    },
    cashBand: {
      mega: [1500, 3000],
      umm: [1100, 2200],
      core: [1000, 1800],
    },
    carry:
      "The role is carry-driven. Partners commonly hold 5–15%+ of the firm’s pool. Realized carry in strong years can reach multi-millions — or tens of millions at top megafunds.",
    timeSplit: [
      { label: "Capital & IC", pct: 35 },
      { label: "LPs & fundraising", pct: 35 },
      { label: "Portfolio & firm", pct: 30 },
    ],
    posture:
      "Investor, operator supervisor, salesperson to LPs, and firm leader. Reputation, network depth, and consistent realized returns define the seat.",
    work: [
      "Set strategy and allocate capital across the portfolio.",
      "Lead or co-lead fundraising and hold key LP relationships.",
      "Make final investment decisions, or chair the investment committee.",
      "Hold the largest share of carried interest — and the accountability that comes with it.",
      "Protect the partnership’s culture and the firm’s name in every room you enter.",
    ],
    inflection:
      "Cash is no longer the story. Realized carry, LP trust, and the next fund are the story.",
  },
];

export function getRank(id: string): Rank | undefined {
  return ranks.find((r) => r.id === id);
}

export const nextRank: Record<RankId, RankId | null> = {
  analyst: "senior-associate",
  "senior-associate": "vice-president",
  "vice-president": "principal",
  principal: "partner",
  partner: null,
};
