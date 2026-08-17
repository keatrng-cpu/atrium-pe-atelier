import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { emptyProfile, type MemberProfile } from "@/data/profile";

const profileSchema = z.object({
  givenName: z.string().trim().min(1, "Name is required").max(80),
  jobLevel: z.string().max(40).optional().default(""),
  birthday: z.string().max(12).optional().default(""),
  company: z.string().max(120).optional().default(""),
  goals: z.string().max(2000).optional().default(""),
  struggles: z.string().max(2000).optional().default(""),
  strengths: z.string().max(2000).optional().default(""),
  education: z.string().max(2000).optional().default(""),
  experience: z.string().max(2000).optional().default(""),
});

function rowToProfile(row: {
  given_name: string;
  job_level: string;
  birthday: string;
  company: string;
  goals: string;
  struggles: string;
  strengths: string;
  education: string;
  experience: string;
}): MemberProfile {
  return {
    givenName: row.given_name,
    jobLevel: row.job_level,
    birthday: row.birthday,
    company: row.company,
    goals: row.goals,
    struggles: row.struggles,
    strengths: row.strengths,
    education: row.education,
    experience: row.experience,
  };
}

export const loadProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
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
    return rows[0] ? rowToProfile(rows[0]) : emptyProfile();
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into member_profile (
        user_id, given_name, job_level, birthday, company, goals, struggles, strengths, education, experience, updated_at
      )
      values (
        ${context.userId}, ${data.givenName}, ${data.jobLevel}, ${data.birthday}, ${data.company},
        ${data.goals}, ${data.struggles}, ${data.strengths}, ${data.education}, ${data.experience}, now()
      )
      on conflict (user_id) do update set
        given_name = excluded.given_name,
        job_level = excluded.job_level,
        birthday = excluded.birthday,
        company = excluded.company,
        goals = excluded.goals,
        struggles = excluded.struggles,
        strengths = excluded.strengths,
        education = excluded.education,
        experience = excluded.experience,
        updated_at = now()
    `;
    return { ok: true as const };
  });
