import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { RESEARCH_SYSTEM, REVIEW_SYSTEM } from "@/data/research";
import { fetchTickerAnalytics, formatMarketBlock, type MarketSnapshot } from "@/lib/engines/market";

export type BriefFact = { claim: string; whyItMatters: string };

export type BriefBody = {
  title: string;
  subject: string;
  asOf: string;
  verdict: string;
  thesis: string;
  facts: BriefFact[];
  risks: string[];
  openQuestions: string[];
  implications: string;
  body: string;
};

export type ReviewNote = {
  grade: "pass" | "revise" | "hold";
  confidence: "high" | "mixed" | "low";
  flags: string[];
  unsupported: string[];
  notes: string;
};

export type ResearchBrief = {
  id: string;
  kind: string;
  query: string;
  ticker: string;
  title: string;
  subject: string;
  verdict: string;
  thesis: string;
  body: BriefBody;
  citations: string[];
  market: MarketSnapshot | null;
  review: ReviewNote;
  status: string;
  createdAt: string;
  publishedAt: string | null;
};

function nid() {
  return crypto.randomUUID();
}

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Research did not return a structured brief.");
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

function asBrief(raw: unknown, fallbackTitle: string): BriefBody {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const facts = Array.isArray(o.facts)
    ? o.facts
        .map((f) => {
          if (typeof f === "string") return { claim: f, whyItMatters: "" };
          const rec = f as Record<string, unknown>;
          return {
            claim: String(rec.claim ?? ""),
            whyItMatters: String(rec.whyItMatters ?? ""),
          };
        })
        .filter((f) => f.claim)
    : [];
  return {
    title: String(o.title ?? fallbackTitle).slice(0, 180),
    subject: String(o.subject ?? fallbackTitle).slice(0, 180),
    asOf: String(o.asOf ?? new Date().toISOString().slice(0, 10)).slice(0, 12),
    verdict: String(o.verdict ?? "").slice(0, 400),
    thesis: String(o.thesis ?? "").slice(0, 1200),
    facts,
    risks: Array.isArray(o.risks) ? o.risks.map((x) => String(x)).filter(Boolean) : [],
    openQuestions: Array.isArray(o.openQuestions)
      ? o.openQuestions.map((x) => String(x)).filter(Boolean)
      : [],
    implications: String(o.implications ?? "").slice(0, 1200),
    body: String(o.body ?? "").slice(0, 14000),
  };
}

function asReview(raw: unknown): ReviewNote {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const grade = o.grade === "pass" || o.grade === "hold" ? o.grade : "revise";
  const confidence = o.confidence === "high" || o.confidence === "low" ? o.confidence : "mixed";
  return {
    grade,
    confidence,
    flags: Array.isArray(o.flags) ? o.flags.map((x) => String(x)).filter(Boolean) : [],
    unsupported: Array.isArray(o.unsupported)
      ? o.unsupported.map((x) => String(x)).filter(Boolean)
      : [],
    notes: String(o.notes ?? "").slice(0, 2000),
  };
}

function extractOutputText(json: Record<string, unknown>) {
  if (typeof json.output_text === "string" && json.output_text.trim()) return json.output_text;
  const output = Array.isArray(json.output) ? json.output : [];
  let text = "";
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const content = rec.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;
      if (typeof b.text === "string") text += b.text;
    }
  }
  return text;
}

function extractCitations(json: Record<string, unknown>) {
  const set = new Set<string>();
  if (Array.isArray(json.citations)) {
    for (const c of json.citations) if (typeof c === "string" && c.startsWith("http")) set.add(c);
  }
  const output = Array.isArray(json.output) ? json.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const anns = (block as Record<string, unknown>).annotations;
      if (!Array.isArray(anns)) continue;
      for (const a of anns) {
        if (a && typeof a === "object" && typeof (a as { url?: string }).url === "string") {
          set.add((a as { url: string }).url);
        }
      }
    }
  }
  return [...set].slice(0, 24);
}

async function callGrok(opts: {
  system: string;
  user: string;
  search: boolean;
  maxTokens: number;
}): Promise<{ text: string; citations: string[] }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("Research is not available in this environment.");

  const models = ["grok-4.5", "grok-4.6"];
  let lastErr = "Research could not be reached.";
  for (const model of models) {
    const res = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_output_tokens: opts.maxTokens,
        input: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        ...(opts.search ? { tools: [{ type: "web_search" }] } : {}),
      }),
    });
    if (!res.ok) {
      lastErr = `Research could not be reached (${res.status}).`;
      continue;
    }
    const json = (await res.json()) as Record<string, unknown>;
    const text = extractOutputText(json).trim();
    if (!text) {
      lastErr = "Research returned an empty page.";
      continue;
    }
    return { text, citations: extractCitations(json) };
  }
  throw new Error(lastErr);
}

function mapRow(row: {
  id: string;
  kind: string;
  query: string;
  ticker: string;
  title: string;
  subject: string;
  verdict: string;
  thesis: string;
  body_json: string;
  citations_json: string;
  market_json: string;
  review_json: string;
  status: string;
  created_at: string;
  published_at: string | null;
}): ResearchBrief {
  let body: BriefBody;
  try {
    body = asBrief(JSON.parse(row.body_json), row.title);
  } catch {
    body = asBrief({}, row.title);
  }
  let citations: string[] = [];
  try {
    citations = JSON.parse(row.citations_json) as string[];
  } catch {
    citations = [];
  }
  let market: MarketSnapshot | null = null;
  try {
    market = row.market_json && row.market_json !== "null" ? (JSON.parse(row.market_json) as MarketSnapshot) : null;
  } catch {
    market = null;
  }
  let review: ReviewNote;
  try {
    review = asReview(JSON.parse(row.review_json));
  } catch {
    review = asReview({});
  }
  return {
    id: row.id,
    kind: row.kind,
    query: row.query,
    ticker: row.ticker,
    title: row.title,
    subject: row.subject,
    verdict: row.verdict,
    thesis: row.thesis,
    body,
    citations,
    market,
    review,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
  };
}

export const listBriefs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      kind: string;
      query: string;
      ticker: string;
      title: string;
      subject: string;
      verdict: string;
      thesis: string;
      body_json: string;
      citations_json: string;
      market_json: string;
      review_json: string;
      status: string;
      created_at: string;
      published_at: string | null;
    }>`
      select id, kind, query, ticker, title, subject, verdict, thesis, body_json, citations_json,
             market_json, review_json, status, created_at, published_at
      from research_briefs
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
    return rows.map(mapRow);
  });

export const getBrief = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      kind: string;
      query: string;
      ticker: string;
      title: string;
      subject: string;
      verdict: string;
      thesis: string;
      body_json: string;
      citations_json: string;
      market_json: string;
      review_json: string;
      status: string;
      created_at: string;
      published_at: string | null;
    }>`
      select id, kind, query, ticker, title, subject, verdict, thesis, body_json, citations_json,
             market_json, review_json, status, created_at, published_at
      from research_briefs
      where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!rows[0]) throw new Error("Brief not found.");
    return mapRow(rows[0]);
  });

export const commissionResearch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        kind: z.enum(["company", "topic", "portfolio", "sector", "market"]),
        query: z.string().trim().min(3).max(800),
        ticker: z.string().max(12).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const ticker = data.ticker.trim().toUpperCase();
    let market: MarketSnapshot | null = null;
    if (ticker) {
      try {
        market = await fetchTickerAnalytics(ticker);
      } catch {
        market = null;
      }
    }

    let houseNote = "";
    try {
      const sql = await getSql();
      const membership = await sql<{ house_id: string }>`
        select house_id from house_members where user_id = ${context.userId} limit 1
      `;
      if (membership[0] && (data.kind === "portfolio" || data.kind === "company")) {
        const book = await sql<{ name: string; sector: string; health: string }>`
          select name, sector, health from house_portfolio where house_id = ${membership[0].house_id}
        `;
        const deals = await sql<{ name: string; sector: string; stage: string }>`
          select name, sector, stage from house_deals where house_id = ${membership[0].house_id}
        `;
        if (book.length) {
          houseNote += `House portfolio: ${book.map((c) => `${c.name} (${c.sector}, ${c.health})`).join("; ")}.\n`;
        }
        if (deals.length) {
          houseNote += `Live book: ${deals.map((d) => `${d.name} · ${d.stage} · ${d.sector}`).join("; ")}.`;
        }
      }
    } catch {
      houseNote = "";
    }

    const userPrompt = [
      `Kind: ${data.kind}`,
      `Query: ${data.query}`,
      ticker ? `Ticker (if public): ${ticker}` : "",
      market ? formatMarketBlock(market) : ticker ? "A ticker was given but the tape could not be fetched. Do not invent a price." : "",
      houseNote ? `Internal house context (not a public source):\n${houseNote}` : "",
      "Write the JSON brief now.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const drafted = await callGrok({
      system: RESEARCH_SYSTEM,
      user: userPrompt,
      search: true,
      maxTokens: 2200,
    });
    const brief = asBrief(extractJson(drafted.text), data.query);

    const reviewUser = [
      `BRIEF JSON:\n${JSON.stringify(brief).slice(0, 10000)}`,
      `CITATIONS:\n${drafted.citations.join("\n") || "(none returned)"}`,
      market ? formatMarketBlock(market) : "No COMPUTED tape.",
    ].join("\n\n");

    let review: ReviewNote;
    try {
      const reviewed = await callGrok({
        system: REVIEW_SYSTEM,
        user: reviewUser,
        search: false,
        maxTokens: 700,
      });
      review = asReview(extractJson(reviewed.text));
    } catch {
      review = {
        grade: "revise",
        confidence: "mixed",
        flags: ["Second-partner review did not complete. Treat figures with care."],
        unsupported: [],
        notes: "Circulate only after a human pass.",
      };
    }

    const id = nid();
    const sql = await getSql();
    await sql`
      insert into research_briefs (
        id, user_id, kind, query, ticker, title, subject, verdict, thesis,
        body_json, citations_json, market_json, review_json, status
      )
      values (
        ${id}, ${context.userId}, ${data.kind}, ${data.query}, ${ticker},
        ${brief.title}, ${brief.subject}, ${brief.verdict}, ${brief.thesis},
        ${JSON.stringify(brief)}, ${JSON.stringify(drafted.citations)},
        ${JSON.stringify(market)}, ${JSON.stringify(review)}, ${"reviewed"}
      )
    `;
    return { id };
  });

export const publishBrief = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update research_briefs
      set status = ${"published"}, published_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });
