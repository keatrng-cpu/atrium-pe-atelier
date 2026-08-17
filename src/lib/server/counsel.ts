import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { COUNSEL_SYSTEM } from "@/data/counsel";
import { jobs, type JobKind } from "@/data/jobs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(12000),
});

export type CounselMessage = z.infer<typeof messageSchema>;

export type CounselResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export const askCounsel = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        rankId: z.string(),
        kind: z.string(),
        messages: z.array(messageSchema).max(12),
        computed: z.string().max(8000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }): Promise<CounselResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "Counsel is not available in this environment." };
    }

    const job = jobs.find((j) => j.id === (data.kind as JobKind));
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return { ok: false, error: "Ask a question first." };

    const system = [
      COUNSEL_SYSTEM,
      `The member is working as if they sit in the ${data.rankId.replaceAll("-", " ")} seat.`,
      job ? `Active job: ${job.title}. ${job.brief}` : "",
      data.computed
        ? `COMPUTED figures follow. Treat them as the only numbers that exist.\n${data.computed}`
        : "No COMPUTED block was supplied. Do not invent deal math.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const history = data.messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 8000),
    }));

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.3,
        max_tokens: data.kind === "counsel" ? 900 : 1600,
        messages: [{ role: "system", content: system }, ...history],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `Counsel could not be reached (${res.status}).` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "Counsel returned an empty page." };

    const sql = await getSql();
    await sql`
      insert into counsel_turns (id, user_id, rank_id, role, content)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.rankId}, ${"user"}, ${lastUser.content.slice(0, 8000)})
    `;
    await sql`
      insert into counsel_turns (id, user_id, rank_id, role, content)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.rankId}, ${"assistant"}, ${text.slice(0, 12000)})
    `;

    return { ok: true, text };
  });
