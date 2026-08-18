export type CompRow = {
  name: string;
  price: number;
  dilutedShares: number;
  netDebt: number;
  preferred: number;
  nci: number;
  ltmRev: number;
  ltmEbitda: number;
  ltmEbit: number;
  ltmNi: number;
  ntmEbitda: number;
};

export type CompSpread = {
  equityValue: number;
  ev: number;
  evRev: number | null;
  evEbitda: number | null;
  evEbit: number | null;
  pe: number | null;
  evNtmEbitda: number | null;
};

export type Stats = {
  n: number;
  median: number | null;
  mean: number | null;
  p25: number | null;
  p75: number | null;
};

function finite(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function ratio(num: number, den: number): number | null {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return num / den;
}

export function spreadComp(row: CompRow): CompSpread {
  const equityValue = finite(row.price) * finite(row.dilutedShares);
  const ev = equityValue + finite(row.netDebt) + finite(row.preferred) + finite(row.nci);
  return {
    equityValue,
    ev,
    evRev: ratio(ev, row.ltmRev),
    evEbitda: ratio(ev, row.ltmEbitda),
    evEbit: ratio(ev, row.ltmEbit),
    pe: ratio(equityValue, row.ltmNi),
    evNtmEbitda: ratio(ev, row.ntmEbitda),
  };
}

export function quantile(values: number[], p: number): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const i = (xs.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return xs[lo];
  return xs[lo] * (1 - (i - lo)) + xs[hi] * (i - lo);
}

export function summarize(values: number[]): Stats {
  const xs = values.filter((v) => Number.isFinite(v));
  const n = xs.length;
  const mean = n ? xs.reduce((a, b) => a + b, 0) / n : null;
  return {
    n,
    median: quantile(xs, 0.5),
    mean,
    p25: quantile(xs, 0.25),
    p75: quantile(xs, 0.75),
  };
}

export type TargetMetrics = {
  ltmRev: number;
  ltmEbitda: number;
  ltmEbit: number;
  ltmNi: number;
  ntmEbitda: number;
  netDebt: number;
};

export type ImpliedBand = {
  metric: string;
  multiple: number | null;
  impliedEv: number | null;
  impliedEquity: number | null;
};

export function implyFromStats(target: TargetMetrics, multiples: {
  evRev: Stats;
  evEbitda: Stats;
  evEbit: Stats;
  evNtmEbitda: Stats;
  pe: Stats;
}): ImpliedBand[] {
  const evFrom = (mult: number | null, den: number) =>
    mult != null && den ? mult * den : null;
  const equityFrom = (ev: number | null) => (ev == null ? null : ev - finite(target.netDebt));
  const rows: ImpliedBand[] = [
    {
      metric: "EV / LTM Revenue",
      multiple: multiples.evRev.median,
      impliedEv: evFrom(multiples.evRev.median, target.ltmRev),
      impliedEquity: null,
    },
    {
      metric: "EV / LTM EBITDA",
      multiple: multiples.evEbitda.median,
      impliedEv: evFrom(multiples.evEbitda.median, target.ltmEbitda),
      impliedEquity: null,
    },
    {
      metric: "EV / LTM EBIT",
      multiple: multiples.evEbit.median,
      impliedEv: evFrom(multiples.evEbit.median, target.ltmEbit),
      impliedEquity: null,
    },
    {
      metric: "EV / NTM EBITDA",
      multiple: multiples.evNtmEbitda.median,
      impliedEv: evFrom(multiples.evNtmEbitda.median, target.ntmEbitda),
      impliedEquity: null,
    },
    {
      metric: "P / E",
      multiple: multiples.pe.median,
      impliedEv: null,
      impliedEquity: multiples.pe.median != null && target.ltmNi ? multiples.pe.median * target.ltmNi : null,
    },
  ];
  return rows.map((r) => ({
    ...r,
    impliedEquity: r.impliedEquity ?? equityFrom(r.impliedEv),
  }));
}

export function bookFromPeers(peers: CompRow[]) {
  const spreads = peers.map((p) => ({ peer: p, spread: spreadComp(p) }));
  const pick = (fn: (s: CompSpread) => number | null) =>
    spreads.map((s) => fn(s.spread)).filter((v): v is number => v != null);
  return {
    spreads,
    evRev: summarize(pick((s) => s.evRev)),
    evEbitda: summarize(pick((s) => s.evEbitda)),
    evEbit: summarize(pick((s) => s.evEbit)),
    evNtmEbitda: summarize(pick((s) => s.evNtmEbitda)),
    pe: summarize(pick((s) => s.pe)),
  };
}

export const samplePeers: CompRow[] = [
  { name: "Alder Industrial", price: 38, dilutedShares: 90, netDebt: 400, preferred: 0, nci: 0, ltmRev: 1800, ltmEbitda: 280, ltmEbit: 190, ltmNi: 110, ntmEbitda: 300 },
  { name: "Marlow Services", price: 24, dilutedShares: 120, netDebt: 210, preferred: 0, nci: 20, ltmRev: 980, ltmEbitda: 165, ltmEbit: 120, ltmNi: 78, ntmEbitda: 180 },
  { name: "Ledger Process", price: 51, dilutedShares: 55, netDebt: 90, preferred: 0, nci: 0, ltmRev: 640, ltmEbitda: 140, ltmEbit: 105, ltmNi: 72, ntmEbitda: 155 },
  { name: "Northline", price: 17, dilutedShares: 200, netDebt: 520, preferred: 40, nci: 0, ltmRev: 2100, ltmEbitda: 315, ltmEbit: 210, ltmNi: 95, ntmEbitda: 330 },
];

export const sampleTarget: TargetMetrics = {
  ltmRev: 1200,
  ltmEbitda: 200,
  ltmEbit: 140,
  ltmNi: 80,
  ntmEbitda: 220,
  netDebt: 350,
};

export type PrecedentRow = {
  name: string;
  year: string;
  ev: number;
  ltmEbitda: number;
  ltmRev: number;
  premium: number;
  buyer: "strategic" | "sponsor";
};

export function spreadPrecedent(row: PrecedentRow) {
  return {
    evEbitda: ratio(row.ev, row.ltmEbitda),
    evRev: ratio(row.ev, row.ltmRev),
  };
}

export const samplePrecedents: PrecedentRow[] = [
  { name: "Helix / Alder", year: "2024", ev: 4200, ltmEbitda: 260, ltmRev: 1500, premium: 0.28, buyer: "strategic" },
  { name: "Marlow / Sponsor", year: "2023", ev: 3100, ltmEbitda: 190, ltmRev: 900, premium: 0.22, buyer: "sponsor" },
  { name: "Ledger / Northline", year: "2025", ev: 2650, ltmEbitda: 145, ltmRev: 700, premium: 0.31, buyer: "strategic" },
  { name: "Process / Midcap", year: "2022", ev: 1800, ltmEbitda: 150, ltmRev: 820, premium: 0.18, buyer: "sponsor" },
];
