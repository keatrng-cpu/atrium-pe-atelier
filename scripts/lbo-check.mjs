import { runPaperLbo, sampleLbo } from "../src/lib/engines/lbo.ts";
import { runCarry } from "../src/lib/engines/carry.ts";

const r = runPaperLbo(sampleLbo);
const expectedEv = 80 * 12;
if (r.entryEv !== expectedEv) throw new Error(`entryEv ${r.entryEv}`);
const residual = Math.abs(r.attribution.checksum);
if (residual > 0.0001) throw new Error(`attribution residual ${r.attribution.checksum}`);
if (r.moic <= 1) throw new Error(`sample MOIC should exceed 1, got ${r.moic}`);

const c = runCarry({
  invested: 100,
  proceeds: 260,
  holdYears: 5,
  hurdle: 0.08,
  carryPct: 0.2,
  catchUp: true,
});
if (Math.abs(c.lpTotal + c.gpTotal - 260) > 0.001) {
  throw new Error(`waterfall does not foot ${c.lpTotal} + ${c.gpTotal}`);
}
console.log(
  JSON.stringify(
    {
      moic: Number(r.moic.toFixed(3)),
      irr: Number((r.irr * 100).toFixed(2)),
      residual: r.attribution.checksum,
      gpShare: Number((c.gpShareOfProfit * 100).toFixed(2)),
    },
    null,
    2,
  ),
);
