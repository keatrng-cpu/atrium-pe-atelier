import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { COUNSEL_SYSTEM } from "@/data/counsel";
import { formatDossier } from "@/data/profile";
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

    const sql = await getSql();
    const dossiers = await sql<{
      given_name: string;
      job_level: string;
      birthday: string;
      company: string;
      goals: string;
      struggles: string;
      strengths: string;
      education: string;
      experience: string;
    }>`
      select given_name, job_level, birthday, company, goals, struggles, strengths, education, experience
      from member_profile
      where user_id = ${context.userId}
    `;
    const dossier = dossiers[0]
      ? formatDossier({
          givenName: dossiers[0].given_name,
          jobLevel: dossiers[0].job_level,
          birthday: dossiers[0].birthday,
          company: dossiers[0].company,
          goals: dossiers[0].goals,
          struggles: dossiers[0].struggles,
          strengths: dossiers[0].strengths,
          education: dossiers[0].education,
          experience: dossiers[0].experience,
        })
      : "";

    const system = [
      COUNSEL_SYSTEM,
      dossier
        ? `MEMBER DOSSIER — remember this. Address them by name. Do not re-ask what is already known. Coach against stated struggles and through stated strengths. Use the stated seat unless they are practicing another one on the desk.\n${dossier}`
        : "No dossier is on file. Do not invent a biography.",
      `The member is practicing the ${data.rankId.replaceAll("-", " ")} seat on the desk.`,
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
