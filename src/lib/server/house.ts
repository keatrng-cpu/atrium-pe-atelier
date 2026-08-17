import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

function nid() {
  return crypto.randomUUID();
}

function inviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export type HouseMember = {
  userId: string;
  seat: string;
  fn: string;
  title: string;
  givenName: string;
  lastSeen: string | null;
};

export type HouseDeal = {
  id: string;
  name: string;
  sector: string;
  stage: string;
  enterpriseValue: string;
  ownerId: string;
  nextAction: string;
  dueOn: string;
  thesis: string;
};

export type HouseMeeting = {
  id: string;
  kind: string;
  title: string;
  startsAt: string;
  location: string;
  agenda: string;
  minutes: string;
  decision: string;
  chairId: string;
  dealId: string;
  status: string;
};

export type HouseAlert = {
  id: string;
  kind: string;
  title: string;
  body: string;
  severity: string;
  dueOn: string;
  dealId: string;
  meetingId: string;
  readAt: string | null;
};

export type HouseCompany = {
  id: string;
  name: string;
  sector: string;
  entryYear: string;
  ownerId: string;
  kpiNote: string;
  health: string;
  nextBoard: string;
};

export type HouseWorkstream = {
  id: string;
  dealId: string;
  title: string;
  ownerId: string;
  status: string;
  dueOn: string;
};

export type HouseBundle = {
  house: {
    id: string;
    name: string;
    thesis: string;
    mandate: string;
    inviteCode: string;
  };
  me: HouseMember;
  members: HouseMember[];
  deals: HouseDeal[];
  workstreams: HouseWorkstream[];
  meetings: HouseMeeting[];
  alerts: HouseAlert[];
  portfolio: HouseCompany[];
};

async function membership(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ house_id: string }>`
    select house_id from house_members where user_id = ${userId} order by joined_at desc limit 1
  `;
  return rows[0]?.house_id ?? null;
}

async function requireHouse(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const houseId = await membership(sql, userId);
  if (!houseId) throw new Error("You are not seated in a house.");
  return houseId;
}

async function loadBundle(sql: Awaited<ReturnType<typeof getSql>>, houseId: string, userId: string): Promise<HouseBundle> {
  const houses = await sql<{
    id: string;
    name: string;
    thesis: string;
    mandate: string;
    invite_code: string;
  }>`select id, name, thesis, mandate, invite_code from houses where id = ${houseId}`;
  const house = houses[0];
  if (!house) throw new Error("House not found.");

  const members = await sql<{
    user_id: string;
    seat: string;
    fn: string;
    title: string;
    given_name: string;
    last_seen: string | null;
  }>`
    select user_id, seat, fn, title, given_name, last_seen
    from house_members where house_id = ${houseId} order by joined_at asc
  `;

  const deals = await sql<{
    id: string;
    name: string;
    sector: string;
    stage: string;
    enterprise_value: string;
    owner_id: string;
    next_action: string;
    due_on: string;
    thesis: string;
  }>`
    select id, name, sector, stage, enterprise_value, owner_id, next_action, due_on, thesis
    from house_deals where house_id = ${houseId} order by created_at desc
  `;

  const workstreams = await sql<{
    id: string;
    deal_id: string;
    title: string;
    owner_id: string;
    status: string;
    due_on: string;
  }>`
    select id, deal_id, title, owner_id, status, due_on
    from house_workstreams where house_id = ${houseId}
  `;

  const meetings = await sql<{
    id: string;
    kind: string;
    title: string;
    starts_at: string;
    location: string;
    agenda: string;
    minutes: string;
    decision: string;
    chair_id: string;
    deal_id: string;
    status: string;
  }>`
    select id, kind, title, starts_at, location, agenda, minutes, decision, chair_id, deal_id, status
    from house_meetings where house_id = ${houseId} order by starts_at asc
  `;

  const alerts = await sql<{
    id: string;
    kind: string;
    title: string;
    body: string;
    severity: string;
    due_on: string;
    deal_id: string;
    meeting_id: string;
    read_at: string | null;
  }>`
    select id, kind, title, body, severity, due_on, deal_id, meeting_id, read_at
    from house_alerts where house_id = ${houseId} order by created_at desc
  `;

  const portfolio = await sql<{
    id: string;
    name: string;
    sector: string;
    entry_year: string;
    owner_id: string;
    kpi_note: string;
    health: string;
    next_board: string;
  }>`
    select id, name, sector, entry_year, owner_id, kpi_note, health, next_board
    from house_portfolio where house_id = ${houseId} order by name asc
  `;

  const mappedMembers = members.map((m) => ({
    userId: m.user_id,
    seat: m.seat,
    fn: m.fn,
    title: m.title,
    givenName: m.given_name,
    lastSeen: m.last_seen,
  }));
  const me = mappedMembers.find((m) => m.userId === userId);
  if (!me) throw new Error("You are not seated in this house.");

  return {
    house: {
      id: house.id,
      name: house.name,
      thesis: house.thesis,
      mandate: house.mandate,
      inviteCode: house.invite_code,
    },
    me,
    members: mappedMembers,
    deals: deals.map((d) => ({
      id: d.id,
      name: d.name,
      sector: d.sector,
      stage: d.stage,
      enterpriseValue: d.enterprise_value,
      ownerId: d.owner_id,
      nextAction: d.next_action,
      dueOn: d.due_on,
      thesis: d.thesis,
    })),
    workstreams: workstreams.map((w) => ({
      id: w.id,
      dealId: w.deal_id,
      title: w.title,
      ownerId: w.owner_id,
      status: w.status,
      dueOn: w.due_on,
    })),
    meetings: meetings.map((m) => ({
      id: m.id,
      kind: m.kind,
      title: m.title,
      startsAt: m.starts_at,
      location: m.location,
      agenda: m.agenda,
      minutes: m.minutes,
      decision: m.decision,
      chairId: m.chair_id,
      dealId: m.deal_id,
      status: m.status,
    })),
    alerts: alerts.map((a) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      body: a.body,
      severity: a.severity,
      dueOn: a.due_on,
      dealId: a.deal_id,
      meetingId: a.meeting_id,
      readAt: a.read_at,
    })),
    portfolio: portfolio.map((p) => ({
      id: p.id,
      name: p.name,
      sector: p.sector,
      entryYear: p.entry_year,
      ownerId: p.owner_id,
      kpiNote: p.kpi_note,
      health: p.health,
      nextBoard: p.next_board,
    })),
  };
}

async function seedHouse(sql: Awaited<ReturnType<typeof getSql>>, houseId: string, founderId: string) {
  const d1 = nid();
  const d2 = nid();
  const d3 = nid();
  const m1 = nid();
  const m2 = nid();

  await sql`
    insert into house_deals (id, house_id, name, sector, stage, enterprise_value, owner_id, next_action, due_on, thesis)
    values
      (${d1}, ${houseId}, ${"Northbridge Industrial"}, ${"Business services"}, ${"diligence"}, ${"$820m"}, ${founderId}, ${"QoE call with PwC"}, ${isoDate(3)}, ${"Route density and pricing power in last-mile facilities."}),
      (${d2}, ${houseId}, ${"Helix Clinical"}, ${"Healthcare"}, ${"ioi"}, ${"$410m"}, ${founderId}, ${"Independent thesis before banker bake-off"}, ${isoDate(5)}, ${"Provider-light diagnostics. Reimbursement is the risk."}),
      (${d3}, ${houseId}, ${"Ledger Payments"}, ${"Fintech"}, ${"sourcing"}, ${"$260m"}, ${founderId}, ${"Founder dinner Thursday"}, ${isoDate(2)}, ${"Vertical software with payments attach. Multiple looks full."})
  `;

  await sql`
    insert into house_workstreams (id, house_id, deal_id, title, owner_id, status, due_on)
    values
      (${nid()}, ${houseId}, ${d1}, ${"Quality of earnings"}, ${founderId}, ${"open"}, ${isoDate(4)}),
      (${nid()}, ${houseId}, ${d1}, ${"Customer concentration"}, ${founderId}, ${"open"}, ${isoDate(6)}),
      (${nid()}, ${houseId}, ${d2}, ${"Reimbursement diligence"}, ${founderId}, ${"open"}, ${isoDate(7)})
  `;

  await sql`
    insert into house_meetings (id, house_id, kind, title, starts_at, location, agenda, chair_id, deal_id, status)
    values
      (${m1}, ${houseId}, ${"pipeline"}, ${"Monday pipeline"}, ${isoDate(0)}, ${"Boardroom A"}, ${"1. Live processes\n2. Passes this week\n3. Coverage gaps"}, ${founderId}, ${""}, ${"scheduled"}),
      (${m2}, ${houseId}, ${"ic"}, ${"IC — Northbridge Industrial"}, ${isoDate(4)}, ${"IC room"}, ${"1. Thesis\n2. Returns\n3. Risks that kill\n4. Decision"}, ${founderId}, ${d1}, ${"scheduled"})
  `;

  await sql`
    insert into house_alerts (id, house_id, kind, title, body, severity, due_on, deal_id, meeting_id)
    values
      (${nid()}, ${houseId}, ${"ic-prep"}, ${"IC memo due"}, ${"Northbridge papers circulate 24 hours before the room."}, ${"urgent"}, ${isoDate(3)}, ${d1}, ${m2}),
      (${nid()}, ${houseId}, ${"deadline"}, ${"QoE draft"}, ${"Accountant draft lands Wednesday. Variance vs CIM add-backs."}, ${"watch"}, ${isoDate(3)}, ${d1}, ${""}),
      (${nid()}, ${houseId}, ${"kpi"}, ${"Helix portfolio print"}, ${"Same-store visits −4% vs underwrite. Pack is late."}, ${"urgent"}, ${isoDate(1)}, ${""}, ${""})
  `;

  await sql`
    insert into house_portfolio (id, house_id, name, sector, entry_year, owner_id, kpi_note, health, next_board)
    values
      (${nid()}, ${houseId}, ${"Alder Facilities"}, ${"Industrials"}, ${"2023"}, ${founderId}, ${"EBITDA +11% vs underwrite. Procurement still open."}, ${"on-plan"}, ${isoDate(12)}),
      (${nid()}, ${houseId}, ${"Marlow Health"}, ${"Healthcare"}, ${"2022"}, ${founderId}, ${"Volume miss two quarters. New CRO in seat 40 days."}, ${"watch"}, ${isoDate(8)})
  `;
}

export const loadHouse = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const houseId = await membership(sql, context.userId);
    if (!houseId) return { ok: false as const, house: null };
    await sql`
      update house_members set last_seen = now()
      where house_id = ${houseId} and user_id = ${context.userId}
    `;
    const bundle = await loadBundle(sql, houseId, context.userId);
    return { ok: true as const, house: bundle };
  });

export const createHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(80),
        thesis: z.string().max(800).optional().default(""),
        mandate: z.string().max(400).optional().default(""),
        seat: z.string().min(1),
        fn: z.string().min(1),
        givenName: z.string().max(80).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await membership(sql, context.userId);
    if (existing) throw new Error("You already sit in a house. Leave it first.");
    const id = nid();
    const code = inviteCode();
    await sql`
      insert into houses (id, name, thesis, mandate, invite_code, created_by)
      values (${id}, ${data.name}, ${data.thesis}, ${data.mandate}, ${code}, ${context.userId})
    `;
    await sql`
      insert into house_members (house_id, user_id, seat, fn, title, given_name, last_seen)
      values (${id}, ${context.userId}, ${data.seat}, ${data.fn}, ${"Founding"}, ${data.givenName}, now())
    `;
    await seedHouse(sql, id, context.userId);
    return { id, inviteCode: code };
  });

export const joinHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        code: z.string().trim().min(4).max(12),
        seat: z.string().min(1),
        fn: z.string().min(1),
        givenName: z.string().max(80).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (await membership(sql, context.userId)) {
      throw new Error("You already sit in a house. Leave it first.");
    }
    const code = data.code.trim().toUpperCase();
    const found = await sql<{ id: string }>`select id from houses where invite_code = ${code}`;
    if (!found[0]) throw new Error("No house uses that code.");
    await sql`
      insert into house_members (house_id, user_id, seat, fn, given_name, last_seen)
      values (${found[0].id}, ${context.userId}, ${data.seat}, ${data.fn}, ${data.givenName}, now())
      on conflict (house_id, user_id) do nothing
    `;
    return { id: found[0].id };
  });

export const leaveHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const houseId = await membership(sql, context.userId);
    if (!houseId) return { ok: true };
    await sql`delete from house_members where house_id = ${houseId} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const updateSeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        userId: z.string(),
        seat: z.string(),
        fn: z.string(),
        title: z.string().max(80).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    await sql`
      update house_members
      set seat = ${data.seat}, fn = ${data.fn}, title = ${data.title}
      where house_id = ${houseId} and user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const saveDeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        name: z.string().trim().min(1).max(120),
        sector: z.string().max(80).optional().default(""),
        stage: z.string(),
        enterpriseValue: z.string().max(40).optional().default(""),
        ownerId: z.string().optional().default(""),
        nextAction: z.string().max(240).optional().default(""),
        dueOn: z.string().max(20).optional().default(""),
        thesis: z.string().max(800).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const id = data.id || nid();
    const owner = data.ownerId || context.userId;
    await sql`
      insert into house_deals (id, house_id, name, sector, stage, enterprise_value, owner_id, next_action, due_on, thesis)
      values (${id}, ${houseId}, ${data.name}, ${data.sector}, ${data.stage}, ${data.enterpriseValue}, ${owner}, ${data.nextAction}, ${data.dueOn}, ${data.thesis})
      on conflict (id) do update set
        name = excluded.name,
        sector = excluded.sector,
        stage = excluded.stage,
        enterprise_value = excluded.enterprise_value,
        owner_id = excluded.owner_id,
        next_action = excluded.next_action,
        due_on = excluded.due_on,
        thesis = excluded.thesis
    `;
    return { id };
  });

export const addWorkstream = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        dealId: z.string(),
        title: z.string().trim().min(1).max(160),
        ownerId: z.string().optional().default(""),
        dueOn: z.string().max(20).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const id = nid();
    await sql`
      insert into house_workstreams (id, house_id, deal_id, title, owner_id, due_on)
      values (${id}, ${houseId}, ${data.dealId}, ${data.title}, ${data.ownerId || context.userId}, ${data.dueOn})
    `;
    return { id };
  });

export const setWorkstreamStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ id: z.string(), status: z.enum(["open", "done"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    await sql`
      update house_workstreams set status = ${data.status}
      where id = ${data.id} and house_id = ${houseId}
    `;
    return { ok: true };
  });

export const saveMeeting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        kind: z.string(),
        title: z.string().trim().min(1).max(160),
        startsAt: z.string().max(40).optional().default(""),
        location: z.string().max(80).optional().default("Boardroom"),
        agenda: z.string().max(4000).optional().default(""),
        dealId: z.string().optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const id = data.id || nid();
    await sql`
      insert into house_meetings (id, house_id, kind, title, starts_at, location, agenda, chair_id, deal_id)
      values (${id}, ${houseId}, ${data.kind}, ${data.title}, ${data.startsAt}, ${data.location}, ${data.agenda}, ${context.userId}, ${data.dealId})
      on conflict (id) do update set
        kind = excluded.kind,
        title = excluded.title,
        starts_at = excluded.starts_at,
        location = excluded.location,
        agenda = excluded.agenda,
        deal_id = excluded.deal_id
    `;
    const members = await sql<{ user_id: string }>`
      select user_id from house_members where house_id = ${houseId}
    `;
    for (const m of members) {
      await sql`
        insert into house_attendance (meeting_id, user_id, status)
        values (${id}, ${m.user_id}, ${"invited"})
        on conflict (meeting_id, user_id) do nothing
      `;
    }
    return { id };
  });

export const updateMeetingRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string(),
        minutes: z.string().max(12000).optional(),
        decision: z.string().max(2000).optional(),
        status: z.enum(["scheduled", "in-session", "adjourned"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    if (data.minutes != null) {
      await sql`update house_meetings set minutes = ${data.minutes} where id = ${data.id} and house_id = ${houseId}`;
    }
    if (data.decision != null) {
      await sql`update house_meetings set decision = ${data.decision} where id = ${data.id} and house_id = ${houseId}`;
    }
    if (data.status) {
      await sql`update house_meetings set status = ${data.status} where id = ${data.id} and house_id = ${houseId}`;
    }
    return { ok: true };
  });

export const setAttendance = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        meetingId: z.string(),
        status: z.enum(["invited", "present", "regrets"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireHouse(sql, context.userId);
    await sql`
      insert into house_attendance (meeting_id, user_id, status)
      values (${data.meetingId}, ${context.userId}, ${data.status})
      on conflict (meeting_id, user_id) do update set status = excluded.status
    `;
    return { ok: true };
  });

export const addRoomNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ meetingId: z.string(), body: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const names = await sql<{ given_name: string }>`
      select given_name from house_members where house_id = ${houseId} and user_id = ${context.userId}
    `;
    const id = nid();
    await sql`
      insert into house_room_notes (id, meeting_id, user_id, author, body)
      values (${id}, ${data.meetingId}, ${context.userId}, ${names[0]?.given_name || "Member"}, ${data.body})
    `;
    return { id };
  });

export const listRoomNotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ meetingId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    await requireHouse(await getSql(), context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      author: string;
      body: string;
      created_at: string;
    }>`
      select id, author, body, created_at from house_room_notes
      where meeting_id = ${data.meetingId} order by created_at asc
    `;
    return rows.map((r) => ({
      id: r.id,
      author: r.author,
      body: r.body,
      createdAt: r.created_at,
    }));
  });

export const listAttendance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ meetingId: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireHouse(sql, context.userId);
    const rows = await sql<{ user_id: string; status: string }>`
      select user_id, status from house_attendance where meeting_id = ${data.meetingId}
    `;
    return rows.map((r) => ({ userId: r.user_id, status: r.status }));
  });

export const saveAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        kind: z.string(),
        title: z.string().trim().min(1).max(160),
        body: z.string().max(800).optional().default(""),
        severity: z.enum(["watch", "urgent"]).optional().default("watch"),
        dueOn: z.string().max(20).optional().default(""),
        dealId: z.string().optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const id = nid();
    await sql`
      insert into house_alerts (id, house_id, kind, title, body, severity, due_on, deal_id)
      values (${id}, ${houseId}, ${data.kind}, ${data.title}, ${data.body}, ${data.severity}, ${data.dueOn}, ${data.dealId})
    `;
    return { id };
  });

export const ackAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    await sql`
      update house_alerts set read_at = now()
      where id = ${data.id} and house_id = ${houseId}
    `;
    return { ok: true };
  });

export const savePortfolio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().optional(),
        name: z.string().trim().min(1).max(120),
        sector: z.string().max(80).optional().default(""),
        entryYear: z.string().max(8).optional().default(""),
        ownerId: z.string().optional().default(""),
        kpiNote: z.string().max(800).optional().default(""),
        health: z.string().optional().default("on-plan"),
        nextBoard: z.string().max(20).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const houseId = await requireHouse(sql, context.userId);
    const id = data.id || nid();
    await sql`
      insert into house_portfolio (id, house_id, name, sector, entry_year, owner_id, kpi_note, health, next_board)
      values (${id}, ${houseId}, ${data.name}, ${data.sector}, ${data.entryYear}, ${data.ownerId || context.userId}, ${data.kpiNote}, ${data.health}, ${data.nextBoard})
      on conflict (id) do update set
        name = excluded.name,
        sector = excluded.sector,
        entry_year = excluded.entry_year,
        owner_id = excluded.owner_id,
        kpi_note = excluded.kpi_note,
        health = excluded.health,
        next_board = excluded.next_board
    `;
    return { id };
  });
