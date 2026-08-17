export type LboInput = {
  entryEbitda: number;
  entryMultiple: number;
  netDebt: number;
  ebitdaCagr: number;
  holdYears: number;
  exitMultiple: number;
  annualDebtPaydown: number;
  transactionFees: number;
};

export type LboResult = {
  entryEv: number;
  uses: number;
  sponsorEquity: number;
  leverageTurns: number;
  exitEbitda: number;
  exitEv: number;
  exitNetDebt: number;
  exitEquity: number;
  moic: number;
  irr: number;
  attribution: {
    ebitdaGrowth: number;
    multipleExpansion: number;
    debtPaydown: number;
    fees: number;
    equityDelta: number;
    checksum: number;
  };
};

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export function runPaperLbo(raw: LboInput): LboResult {
  const entryEbitda = n(raw.entryEbitda);
  const entryMultiple = n(raw.entryMultiple);
  const netDebt = n(raw.netDebt);
  const ebitdaCagr = n(raw.ebitdaCagr);
  const holdYears = Math.max(0.25, n(raw.holdYears));
  const exitMultiple = n(raw.exitMultiple);
  const annualDebtPaydown = n(raw.annualDebtPaydown);
  const fees = Math.max(0, n(raw.transactionFees));

  const entryEv = entryEbitda * entryMultiple;
  const uses = entryEv + fees;
  const sponsorEquity = uses - netDebt;
  const leverageTurns = entryEbitda > 0 ? netDebt / entryEbitda : 0;

  const exitEbitda = entryEbitda * (1 + ebitdaCagr) ** holdYears;
  const exitEv = exitEbitda * exitMultiple;
  const exitNetDebt = Math.max(0, netDebt - annualDebtPaydown * holdYears);
  const exitEquity = exitEv - exitNetDebt;

  const moic = sponsorEquity > 0 ? exitEquity / sponsorEquity : 0;
  const irr = moic > 0 ? moic ** (1 / holdYears) - 1 : 0;

  const ebitdaGrowth = (exitEbitda - entryEbitda) * entryMultiple;
  const multipleExpansion = exitEbitda * (exitMultiple - entryMultiple);
  const debtPaydown = netDebt - exitNetDebt;
  const equityDelta = exitEquity - sponsorEquity;
  const checksum = ebitdaGrowth + multipleExpansion + debtPaydown - fees;
  const residual = equityDelta - checksum;

  return {
    entryEv,
    uses,
    sponsorEquity,
    leverageTurns,
    exitEbitda,
    exitEv,
    exitNetDebt,
    exitEquity,
    moic,
    irr,
    attribution: {
      ebitdaGrowth,
      multipleExpansion,
      debtPaydown,
      fees,
      equityDelta,
      checksum: residual,
    },
  };
}

export function formatUsd(value: number, digits = 1) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(digits)}bn`;
  return `${sign}$${abs.toFixed(digits)}m`;
}

export function formatPct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatTurns(value: number) {
  return `${value.toFixed(1)}x`;
}

export const sampleLbo: LboInput = {
  entryEbitda: 80,
  entryMultiple: 12,
  netDebt: 480,
  ebitdaCagr: 0.08,
  holdYears: 5,
  exitMultiple: 12,
  annualDebtPaydown: 24,
  transactionFees: 20,
};
