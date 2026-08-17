import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type WorkRow = {
  id: string;
  kind: string;
  title: string;
  inputJson: string;
  outputJson: string;
  createdAt: string;
};

export const listWork = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      kind: string;
      title: string;
      input_json: string;
      output_json: string;
      created_at: string;
    }>`
      select id, kind, title, input_json, output_json, created_at
      from work_products
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      inputJson: row.input_json,
      outputJson: row.output_json,
      createdAt: row.created_at,
    })) satisfies WorkRow[];
  });

export const saveWork = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        kind: z.string().min(1).max(40),
        title: z.string().min(1).max(160),
        inputJson: z.string().max(20000),
        outputJson: z.string().max(24000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into work_products (id, user_id, kind, title, input_json, output_json)
      values (${id}, ${context.userId}, ${data.kind}, ${data.title}, ${data.inputJson}, ${data.outputJson})
    `;
    return { id };
  });
