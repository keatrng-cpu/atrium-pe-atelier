export type MarketPoint = { t: number; close: number };

export type MarketSnapshot = {
  ticker: string;
  name: string;
  currency: string;
  last: number;
  changePct: number;
  high52: number | null;
  low52: number | null;
  marketCap: number | null;
  ret1m: number | null;
  ret3m: number | null;
  ret1y: number | null;
  series: MarketPoint[];
  asOf: string;
};

function n(v: unknown) {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : null;
}

function returnFrom(closes: number[], days: number) {
  if (closes.length < 3) return null;
  const end = closes[closes.length - 1];
  const start = closes[Math.max(0, closes.length - 1 - days)];
  if (!end || !start) return null;
  return end / start - 1;
}

export async function fetchTickerAnalytics(raw: string): Promise<MarketSnapshot | null> {
  const ticker = raw.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
  if (!ticker || ticker.length > 12) return null;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1y&interval=1d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AtriumResearch/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    chart?: {
      result?: {
        meta?: {
          symbol?: string;
          shortName?: string;
          longName?: string;
          currency?: string;
          regularMarketPrice?: number;
          chartPreviousClose?: number;
          fiftyTwoWeekHigh?: number;
          fiftyTwoWeekLow?: number;
          marketCap?: number;
        };
        timestamp?: number[];
        indicators?: { quote?: { close?: (number | null)[] }[] };
      }[];
    };
  };
  const result = body.chart?.result?.[0];
  if (!result?.meta) return null;
  const meta = result.meta;
  const stamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const series: MarketPoint[] = [];
  const clean: number[] = [];
  for (let i = 0; i < stamps.length; i++) {
    const c = n(closes[i]);
    if (c == null || c <= 0) continue;
    series.push({ t: stamps[i] * 1000, close: c });
    clean.push(c);
  }
  const last = n(meta.regularMarketPrice) ?? clean[clean.length - 1] ?? null;
  if (last == null) return null;
  const prev = n(meta.chartPreviousClose);
  const changePct = prev && prev > 0 ? last / prev - 1 : 0;

  return {
    ticker: meta.symbol ?? ticker,
    name: meta.longName || meta.shortName || ticker,
    currency: meta.currency || "USD",
    last,
    changePct,
    high52: n(meta.fiftyTwoWeekHigh),
    low52: n(meta.fiftyTwoWeekLow),
    marketCap: n(meta.marketCap),
    ret1m: returnFrom(clean, 21),
    ret3m: returnFrom(clean, 63),
    ret1y: returnFrom(clean, 252),
    series: series.filter((_, i) => i % 3 === 0 || i === series.length - 1).slice(-80),
    asOf: new Date().toISOString().slice(0, 10),
  };
}

export function formatMarketBlock(m: MarketSnapshot) {
  const pct = (v: number | null) => (v == null ? "n/a" : `${(v * 100).toFixed(2)}%`);
  const money = (v: number) =>
    v >= 1e12
      ? `${(v / 1e12).toFixed(2)}tn`
      : v >= 1e9
        ? `${(v / 1e9).toFixed(2)}bn`
        : v >= 1e6
          ? `${(v / 1e6).toFixed(1)}m`
          : v.toFixed(2);
  return [
    `COMPUTED market tape for ${m.ticker} (${m.name}), as of ${m.asOf}. These figures are calculated from public daily prints, not from the model.`,
    `Last ${m.last.toFixed(2)} ${m.currency} · session ${pct(m.changePct)}`,
    `52-week ${m.low52 ?? "n/a"}–${m.high52 ?? "n/a"}`,
    `Market cap ${m.marketCap != null ? money(m.marketCap) : "n/a"}`,
    `Total return 1m ${pct(m.ret1m)} · 3m ${pct(m.ret3m)} · 1y ${pct(m.ret1y)}`,
  ].join("\n");
}
