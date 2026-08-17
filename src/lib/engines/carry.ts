export type CarryInput = {
  invested: number;
  proceeds: number;
  holdYears: number;
  hurdle: number;
  carryPct: number;
  catchUp: boolean;
};

export type CarryResult = {
  profit: number;
  preferred: number;
  leftoverAfterPref: number;
  gpCatchUp: number;
  residual: number;
  lpResidual: number;
  gpPromote: number;
  lpTotal: number;
  gpTotal: number;
  gpShareOfProfit: number;
};

export function runCarry(raw: CarryInput): CarryResult {
  const invested = Math.max(0, raw.invested);
  const proceeds = Math.max(0, raw.proceeds);
  const years = Math.max(0.25, raw.holdYears);
  const hurdle = Math.max(0, raw.hurdle);
  const carry = Math.min(0.5, Math.max(0, raw.carryPct));

  const profit = proceeds - invested;
  if (profit <= 0) {
    return {
      profit,
      preferred: 0,
      leftoverAfterPref: 0,
      gpCatchUp: 0,
      residual: 0,
      lpResidual: 0,
      gpPromote: 0,
      lpTotal: proceeds,
      gpTotal: 0,
      gpShareOfProfit: 0,
    };
  }

  const preferred = invested * ((1 + hurdle) ** years - 1);
  const leftoverAfterPref = Math.max(0, profit - preferred);

  let gpCatchUp = 0;
  let residual = leftoverAfterPref;
  if (raw.catchUp && leftoverAfterPref > 0 && carry > 0 && carry < 1) {
    const catchUpTarget = (preferred * carry) / (1 - carry);
    gpCatchUp = Math.min(leftoverAfterPref, catchUpTarget);
    residual = leftoverAfterPref - gpCatchUp;
  }

  const gpPromote = residual * carry;
  const lpResidual = residual * (1 - carry);
  const gpTotal = gpCatchUp + gpPromote;
  const lpTotal = invested + preferred + lpResidual;
  const gpShareOfProfit = profit > 0 ? gpTotal / profit : 0;

  return {
    profit,
    preferred,
    leftoverAfterPref,
    gpCatchUp,
    residual,
    lpResidual,
    gpPromote,
    lpTotal,
    gpTotal,
    gpShareOfProfit,
  };
}
