import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { letterTemplates } from "@/data/letters";
import { masterySkills } from "@/data/mastery";

export type CorrespondenceRow = {
  id: string;
  letterKey: string;
  subject: string;
  openedAt: string | null;
  createdAt: string;
};

export type ProgressRow = {
  skillId: string;
  status: string;
  notes: string;
};

export type StudioRow = {
  targetRank: string;
  firmTier: string;
  dealLog: string;
};

function newId() {
  return crypto.randomUUID();
}

export const listCorrespondence = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{
      id: string;
      letter_key: string;
      subject: string;
      opened_at: string | null;
      created_at: string;
    }>`
      select id, letter_key, subject, opened_at, created_at
      from correspondence
      where user_id = ${context.userId}
      order by created_at asc
    `;

    if (existing.length === 0) {
      for (const letter of letterTemplates) {
        await sql`
          insert into correspondence (id, user_id, letter_key, subject)
          values (${newId()}, ${context.userId}, ${letter.key}, ${letter.subject})
          on conflict (user_id, letter_key) do nothing
        `;
      }
      const seeded = await sql<{
        id: string;
        letter_key: string;
        subject: string;
        opened_at: string | null;
        created_at: string;
      }>`
        select id, letter_key, subject, opened_at, created_at
        from correspondence
        where user_id = ${context.userId}
        order by created_at asc
      `;
      return seeded.map((row) => ({
        id: row.id,
        letterKey: row.letter_key,
        subject: row.subject,
        openedAt: row.opened_at,
        createdAt: row.created_at,
      })) satisfies CorrespondenceRow[];
    }

    return existing.map((row) => ({
      id: row.id,
      letterKey: row.letter_key,
      subject: row.subject,
      openedAt: row.opened_at,
      createdAt: row.created_at,
    })) satisfies CorrespondenceRow[];
  });

export const markLetterOpened = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update correspondence
      set opened_at = coalesce(opened_at, now())
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const loadStudio = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profiles = await sql<{
      target_rank: string;
      firm_tier: string;
      deal_log: string;
    }>`
      select target_rank, firm_tier, deal_log
      from studio_profile
      where user_id = ${context.userId}
    `;
    if (profiles.length === 0) {
      await sql`
        insert into studio_profile (user_id)
        values (${context.userId})
        on conflict (user_id) do nothing
      `;
    }
    const profile = profiles[0] ?? {
      target_rank: "analyst",
      firm_tier: "umm",
      deal_log: "",
    };

    const progress = await sql<{
      skill_id: string;
      status: string;
      notes: string;
    }>`
      select skill_id, status, notes
      from mastery_progress
      where user_id = ${context.userId}
    `;

    const byId = new Map(progress.map((p) => [p.skill_id, p]));
    const skills: ProgressRow[] = masterySkills.map((skill) => {
      const row = byId.get(skill.id);
      return {
        skillId: skill.id,
        status: row?.status ?? "unstarted",
        notes: row?.notes ?? "",
      };
    });

    return {
      profile: {
        targetRank: profile.target_rank,
        firmTier: profile.firm_tier,
        dealLog: profile.deal_log,
      } satisfies StudioRow,
      skills,
    };
  });

export const saveStudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        targetRank: z.string(),
        firmTier: z.string(),
        dealLog: z.string(),
        skills: z.array(
          z.object({
            skillId: z.string(),
            status: z.enum(["unstarted", "practicing", "mastered"]),
            notes: z.string(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into studio_profile (user_id, target_rank, firm_tier, deal_log, updated_at)
      values (${context.userId}, ${data.targetRank}, ${data.firmTier}, ${data.dealLog}, now())
      on conflict (user_id) do update set
        target_rank = excluded.target_rank,
        firm_tier = excluded.firm_tier,
        deal_log = excluded.deal_log,
        updated_at = now()
    `;
    for (const skill of data.skills) {
      await sql`
        insert into mastery_progress (user_id, skill_id, status, notes, updated_at)
        values (${context.userId}, ${skill.skillId}, ${skill.status}, ${skill.notes}, now())
        on conflict (user_id, skill_id) do update set
          status = excluded.status,
          notes = excluded.notes,
          updated_at = now()
      `;
    }
    return { ok: true };
  });
