export type MergerInput = {
  acqNi: number;
  acqShares: number;
  acqPrice: number;
  tgtNi: number;
  offerEquity: number;
  cashPct: number;
  synergies: number;
  tax: number;
  rate: number;
};

export type MergerResult = {
  standAloneEps: number;
  cashUsed: number;
  stockValue: number;
  newShares: number;
  newDebt: number;
  afterTaxInterest: number;
  afterTaxSynergies: number;
  pfNi: number;
  pfShares: number;
  pfEps: number;
  accretion: number;
  accretive: boolean;
};

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export function runMerger(raw: MergerInput): MergerResult {
  const cashPct = Math.min(1, Math.max(0, n(raw.cashPct)));
  const standAloneEps = n(raw.acqShares) > 0 ? n(raw.acqNi) / n(raw.acqShares) : 0;
  const cashUsed = n(raw.offerEquity) * cashPct;
  const stockValue = n(raw.offerEquity) * (1 - cashPct);
  const newShares = n(raw.acqPrice) > 0 ? stockValue / n(raw.acqPrice) : 0;
  const newDebt = cashUsed;
  const afterTaxInterest = newDebt * n(raw.rate) * (1 - n(raw.tax));
  const afterTaxSynergies = n(raw.synergies) * (1 - n(raw.tax));
  const pfNi = n(raw.acqNi) + n(raw.tgtNi) + afterTaxSynergies - afterTaxInterest;
  const pfShares = n(raw.acqShares) + newShares;
  const pfEps = pfShares > 0 ? pfNi / pfShares : 0;
  const accretion = standAloneEps !== 0 ? pfEps / standAloneEps - 1 : 0;
  return {
    standAloneEps,
    cashUsed,
    stockValue,
    newShares,
    newDebt,
    afterTaxInterest,
    afterTaxSynergies,
    pfNi,
    pfShares,
    pfEps,
    accretion,
    accretive: pfEps > standAloneEps,
  };
}

export const sampleMerger: MergerInput = {
  acqNi: 420,
  acqShares: 180,
  acqPrice: 48,
  tgtNi: 80,
  offerEquity: 1850,
  cashPct: 0.6,
  synergies: 40,
  tax: 0.25,
  rate: 0.06,
};
