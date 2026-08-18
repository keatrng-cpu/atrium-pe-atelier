export const streetTime = [
  { label: "Financial modeling", pct: 40, note: "Three-statement, DCF, LBO, merger, sensitivities. Error-free and flexible at 2 a.m." },
  { label: "Pitch books, teasers, CIMs", pct: 30, note: "Pixel-perfect decks. Seniors return markups. You revise." },
  { label: "Research and comps", pct: 18, note: "Filings, consensus, peer sets, precedents. Spread, then normalize." },
  { label: "Process and diligence", pct: 12, note: "VDRs, question lists, working-group lists. Limited client airtime." },
] as const;

export const streetDay = [
  "Overnight mail and the tape. What moved, and what a senior will ask before 9.",
  "Urgent model or slide for a morning meeting. Last night’s markup first.",
  "Deeper modeling or a comps refresh while the book is quiet.",
  "Senior markup lands. You stay until the page is clean.",
];

export const streetTasks = [
  {
    title: "Financial modeling",
    body: "Three-statement models linked dynamically. DCF. LBO for sponsor buyers. Merger models with accretion/dilution. Sensitivity tables. Synergy cases. A late change — synergies $150m to $200m, mix of cash and stock — must recompute without breaking the book.",
  },
  {
    title: "Pitch books and live materials",
    body: "Teasers, 50-page CIMs, management presentations, board books. Alignment, charts, one fact per claim. The street does not forgive a number that does not foot.",
  },
  {
    title: "Company and industry research",
    body: "10-K/Q, 8-K, proxies, equity research, press. Comparable lists, precedent sets, TAM, competitive maps, target lists. Atrium’s research desk searches the open web and computes the public tape. There is no Capital IQ behind this wall.",
  },
  {
    title: "Diligence and process",
    body: "Question lists, response tracking, lawyers and accountants, management meetings. The analyst organizes. The associate owns. The VP is in the room.",
  },
];

export const evBuild = [
  { term: "Equity value", how: "Share price × diluted shares (basic + in-the-money options via treasury method + RSUs + converts if in-the-money). Pull the count from the latest 10-K/Q or proxy." },
  { term: "Net debt", how: "Interest-bearing debt (ST + LT + current portion + finance leases) − cash − short-term investments. Watch pensions, operating leases, restricted cash." },
  { term: "Enterprise value", how: "Equity value + net debt + preferred + NCI − non-operating assets. Capital-structure-neutral. The numerator of EV multiples." },
];

export const denominators = [
  { term: "Revenue", why: "Top line. EV/Revenue when EBITDA is negative or distorted." },
  { term: "Gross profit / margin", why: "Pricing power and cost structure." },
  { term: "EBITDA", why: "The workhorse. Operating cash-flow proxy before structure, tax, and non-cash. Start from EBIT + D&A; add back one-times and, in tech, often SBC." },
  { term: "EBIT", why: "After D&A. Use EV/EBIT when depreciation is economically real." },
  { term: "Net income / EPS", why: "P/E. Sensitive to leverage and one-times." },
  { term: "UFCF", why: "EBIT×(1−t) + D&A − CapEx − ΔNWC. The DCF unit." },
];

export const dcfPoints = [
  { term: "Forecast", body: "5–10 years of revenue, margins, D&A, CapEx, ΔNWC, tax. High-growth names consume cash in NWC." },
  { term: "Terminal value", body: "Often 60–80% of EV. Perpetuity: UFCFN+1 / (WACC − g), g typically 2–3%. Or exit multiple on final-year EBITDA, cross-checked to comps." },
  { term: "WACC", body: "ke = rf + βL × ERP. βL = βU × [1+(1−t)(D/E)]. kd from YTM or comps. Weights at market or target structure." },
];

export const sellingPoints = [
  { title: "Size of the opportunity", body: "TAM / SAM / SOM with a quantified CAGR and a path to share." },
  { title: "Growth drivers and unit economics", body: "Named levers — product, geography, price, operating leverage — with history behind them. LTV/CAC where it is real." },
  { title: "Moat", body: "Barriers, IP, brand, network, cost. Evidence, not adjectives." },
  { title: "Financial profile", body: "Growth, margin expansion, cash conversion, a path that is achievable." },
  { title: "Strategic fit", body: "Quantified cost or revenue synergies. Complementary footprint." },
  { title: "Sponsor returns", body: "Debt capacity, operational improvement, IRR/MOIC under a realistic exit." },
  { title: "Management", body: "Domain, delivery, ownership." },
  { title: "Value versus price", body: "Why the ask is rational versus comps or intrinsic. Timing and scarcity, if true." },
  { title: "Credibility of the process", body: "A room that is actually organized. A competitive set that is real." },
];
