import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { bookFromPeers, implyFromStats, samplePeers, sampleTarget, spreadComp } from "../src/lib/engines/comps.ts";
import { runDcf, sampleDcf, waccOf } from "../src/lib/engines/dcf.ts";
import { runMerger, sampleMerger } from "../src/lib/engines/merger.ts";
import { scoreQuality, sampleQuality } from "../src/lib/engines/quality.ts";

describe("trading comps", () => {
  test("EV is equity plus net debt and other claims", () => {
    const s = spreadComp(samplePeers[0]);
    assert.equal(s.equityValue, 38 * 90);
    assert.equal(s.ev, 38 * 90 + 400);
    assert.ok(s.evEbitda != null && Math.abs(s.evEbitda - s.ev / 280) < 1e-9);
  });

  test("implied equity from median EBITDA multiple minus net debt", () => {
    const book = bookFromPeers(samplePeers);
    const implied = implyFromStats(sampleTarget, book);
    const ebitda = implied.find((r) => r.metric.includes("LTM EBITDA"));
    assert.ok(ebitda?.multiple && ebitda.impliedEv);
    assert.ok(Math.abs((ebitda.impliedEquity ?? 0) - (ebitda.impliedEv - 350)) < 1e-6);
    assert.ok(book.evEbitda.median != null);
  });
});

describe("DCF", () => {
  test("WACC is a weighted ke and after-tax kd", () => {
    const w = waccOf(sampleDcf);
    const we = 1 / 1.4;
    const ke = 0.042 + w.betaL * 0.05;
    const expect = we * ke + (1 - we) * 0.055 * 0.75;
    assert.ok(Math.abs(w.wacc - expect) < 1e-9);
  });

  test("sample DCF produces a positive EV that foots to discounted cash", () => {
    const r = runDcf(sampleDcf);
    assert.ok(r.evMid > 0);
    assert.ok(r.years.length === 5);
    const last = r.years[4];
    assert.ok(last.revenue > sampleDcf.revenue0);
    assert.ok(Math.abs(r.evGordon - (r.pvExplicit + r.pvGordon)) < 1e-6);
    assert.ok(Math.abs(r.equityMid - (r.evMid - sampleDcf.netDebt)) < 1e-6);
  });
});

describe("merger", () => {
  test("all-cash deal issues no shares and is financed with debt", () => {
    const r = runMerger({ ...sampleMerger, cashPct: 1 });
    assert.equal(r.newShares, 0);
    assert.equal(r.newDebt, sampleMerger.offerEquity);
    assert.ok(r.pfShares === sampleMerger.acqShares);
  });

  test("sample mix produces a defined accretion figure", () => {
    const r = runMerger(sampleMerger);
    assert.ok(Number.isFinite(r.accretion));
    assert.ok(r.pfShares > sampleMerger.acqShares);
  });
});

describe("quality", () => {
  test("mean of sample scores is in-line or better", () => {
    const s = scoreQuality(sampleQuality);
    assert.ok(s.mean >= 3);
    assert.notEqual(s.label, "discount");
  });
});
