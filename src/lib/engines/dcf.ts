export type DcfInput = {
  revenue0: number;
  revGrowth: number;
  ebitMargin: number;
  daPctRev: number;
  capexPctRev: number;
  nwcPctRev: number;
  tax: number;
  years: number;
  g: number;
  exitMultiple: number;
  rf: number;
  erp: number;
  unleveredBeta: number;
  de: number;
  costDebt: number;
  netDebt: number;
};

export type DcfYear = {
  year: number;
  revenue: number;
  ebit: number;
  nopat: number;
  da: number;
  capex: number;
  nwc: number;
  dnwc: number;
  ufcf: number;
};

export type DcfResult = {
  wacc: number;
  costEquity: number;
  leveredBeta: number;
  years: DcfYear[];
  pvExplicit: number;
  tvGordon: number;
  tvExit: number;
  pvGordon: number;
  pvExit: number;
  evGordon: number;
  evExit: number;
  evMid: number;
  equityGordon: number;
  equityExit: number;
  equityMid: number;
  gridWaccGrowth: { wacc: number; g: number; ev: number }[];
  gridWaccExit: { wacc: number; exit: number; ev: number }[];
};

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export function leveredBeta(unlevered: number, tax: number, de: number) {
  return n(unlevered) * (1 + (1 - n(tax)) * n(de));
}

export function waccOf(input: Pick<DcfInput, "rf" | "erp" | "unleveredBeta" | "de" | "costDebt" | "tax">) {
  const betaL = leveredBeta(input.unleveredBeta, input.tax, input.de);
  const ke = n(input.rf) + betaL * n(input.erp);
  const we = 1 / (1 + n(input.de));
  const wd = 1 - we;
  const wacc = we * ke + wd * n(input.costDebt) * (1 - n(input.tax));
  return { betaL, ke, we, wd, wacc };
}

export function projectYears(input: DcfInput): DcfYear[] {
  const years = Math.max(1, Math.min(15, Math.round(n(input.years))));
  const out: DcfYear[] = [];
  let prevNwc = n(input.revenue0) * n(input.nwcPctRev);
  for (let y = 1; y <= years; y++) {
    const revenue = n(input.revenue0) * (1 + n(input.revGrowth)) ** y;
    const ebit = revenue * n(input.ebitMargin);
    const nopat = ebit * (1 - n(input.tax));
    const da = revenue * n(input.daPctRev);
    const capex = revenue * n(input.capexPctRev);
    const nwc = revenue * n(input.nwcPctRev);
    const dnwc = nwc - prevNwc;
    const ufcf = nopat + da - capex - dnwc;
    out.push({ year: y, revenue, ebit, nopat, da, capex, nwc, dnwc, ufcf });
    prevNwc = nwc;
  }
  return out;
}

function evFrom(years: DcfYear[], wacc: number, g: number, exitMultiple: number, ebitdaLast: number) {
  const discount = (cf: number, t: number) => cf / (1 + wacc) ** t;
  const pvExplicit = years.reduce((s, y) => s + discount(y.ufcf, y.year), 0);
  const last = years[years.length - 1];
  const ufcfN1 = last.ufcf * (1 + g);
  const tvGordon = wacc > g ? ufcfN1 / (wacc - g) : 0;
  const tvExit = ebitdaLast * exitMultiple;
  const pvGordon = discount(tvGordon, last.year);
  const pvExit = discount(tvExit, last.year);
  return {
    pvExplicit,
    tvGordon,
    tvExit,
    pvGordon,
    pvExit,
    evGordon: pvExplicit + pvGordon,
    evExit: pvExplicit + pvExit,
  };
}

export function runDcf(raw: DcfInput): DcfResult {
  const input = { ...raw, years: Math.max(1, Math.min(15, Math.round(n(raw.years)))) };
  const { betaL, ke, wacc } = waccOf(input);
  const years = projectYears(input);
  const last = years[years.length - 1];
  const ebitdaLast = last.ebit + last.da;
  const core = evFrom(years, wacc, n(input.g), n(input.exitMultiple), ebitdaLast);
  const evMid = (core.evGordon + core.evExit) / 2;

  const waccs = [wacc - 0.01, wacc - 0.005, wacc, wacc + 0.005, wacc + 0.01].filter((w) => w > 0.01);
  const gs = [n(input.g) - 0.005, n(input.g), n(input.g) + 0.005];
  const exits = [n(input.exitMultiple) - 1, n(input.exitMultiple), n(input.exitMultiple) + 1];

  const gridWaccGrowth = waccs.flatMap((w) =>
    gs.map((g) => ({ wacc: w, g, ev: evFrom(years, w, g, n(input.exitMultiple), ebitdaLast).evGordon })),
  );
  const gridWaccExit = waccs.flatMap((w) =>
    exits.map((exit) => ({
      wacc: w,
      exit,
      ev: evFrom(years, w, n(input.g), exit, ebitdaLast).evExit,
    })),
  );

  return {
    wacc,
    costEquity: ke,
    leveredBeta: betaL,
    years,
    ...core,
    evMid,
    equityGordon: core.evGordon - n(input.netDebt),
    equityExit: core.evExit - n(input.netDebt),
    equityMid: evMid - n(input.netDebt),
    gridWaccGrowth,
    gridWaccExit,
  };
}

export const sampleDcf: DcfInput = {
  revenue0: 1200,
  revGrowth: 0.08,
  ebitMargin: 0.12,
  daPctRev: 0.04,
  capexPctRev: 0.05,
  nwcPctRev: 0.08,
  tax: 0.25,
  years: 5,
  g: 0.025,
  exitMultiple: 11,
  rf: 0.042,
  erp: 0.05,
  unleveredBeta: 0.95,
  de: 0.4,
  costDebt: 0.055,
  netDebt: 350,
};
