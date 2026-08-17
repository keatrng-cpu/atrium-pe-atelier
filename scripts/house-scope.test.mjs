/**
 * Scope + tenancy regression tests for the house (see SCOPE.md).
 *
 * Two things are checked, because they fail in two different ways:
 *
 *   1. The SCHEMA, against a real embedded Postgres. Migrations are the single
 *      source of truth and they apply to Neon during the Vercel build — a
 *      statement that PGLite accepts but Postgres rejects (or vice versa) would
 *      otherwise surface as a failed deploy. Applying them here, in order, is
 *      the cheapest place to catch it.
 *
 *   2. The GUARDS, against the source of `src/lib/server/house.ts`. Because a
 *      seat grants everything inside a house (SCOPE.md § 6), the house boundary
 *      is the only boundary — so every server function taking a caller-supplied
 *      id must call a tenancy guard. That is a rule about code that has to hold
 *      for functions nobody has written yet, so it is asserted structurally
 *      rather than by exercising the handlers (which would need a full TanStack
 *      Start request context to invoke).
 */
import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const houseSource = readFileSync(join(root, "src/lib/server/house.ts"), "utf8");

const SEEDED_TABLES = [
  "house_deals",
  "house_workstreams",
  "house_meetings",
  "house_alerts",
  "house_portfolio",
];

describe("migrations apply to Postgres", () => {
  /** @type {PGlite} */
  let pg;

  before(async () => {
    pg = new PGlite();
    await pg.waitReady;
    const dir = join(root, "migrations");
    // Same ordering rule as src/lib/db.ts and scripts/migrate.mjs.
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      await pg.exec(readFileSync(join(dir, name), "utf8"));
    }
  });

  after(async () => {
    await pg?.close();
  });

  test("every migration file applies in order", () => {
    // Reaching here means before() ran every file without throwing.
    assert.ok(pg);
  });

  for (const table of SEEDED_TABLES) {
    test(`${table}.seeded exists and defaults to false`, async () => {
      const { rows } = await pg.query(
        `select data_type, column_default, is_nullable
           from information_schema.columns
          where table_name = $1 and column_name = 'seeded'`,
        [table],
      );
      assert.equal(rows.length, 1, `${table} is missing the seeded column`);
      assert.equal(rows[0].data_type, "boolean");
      assert.equal(rows[0].is_nullable, "NO");
      // Member-authored rows must read as real work without naming the column.
      assert.match(String(rows[0].column_default), /false/);
    });
  }

  test("clearing a seeded deal takes its workstreams with it", async () => {
    await pg.exec(`
      insert into houses (id, name, invite_code, created_by)
        values ('h1', 'Northbridge', 'AAA111', 'u1');
      insert into house_deals (id, house_id, name, seeded)
        values ('d-seed', 'h1', 'Demo process', true),
               ('d-real', 'h1', 'Our process', false);
      insert into house_workstreams (id, house_id, deal_id, title)
        values ('w1', 'h1', 'd-seed', 'Quality of earnings'),
               ('w2', 'h1', 'd-real', 'Ours');
    `);

    await pg.query("delete from house_deals where house_id = $1 and seeded = true", ["h1"]);

    const deals = await pg.query("select id from house_deals where house_id = $1", ["h1"]);
    assert.deepEqual(
      deals.rows.map((r) => r.id),
      ["d-real"],
      "clearing the demo book must leave member work untouched",
    );
    const streams = await pg.query("select id from house_workstreams where house_id = $1", ["h1"]);
    assert.deepEqual(
      streams.rows.map((r) => r.id),
      ["w2"],
      "a demo deal's workstreams must cascade away with it",
    );
  });
});

describe("house tenancy guards (SCOPE.md § 6)", () => {
  /**
   * Server functions whose validator accepts an id naming an existing row, and
   * the guard each must call first. `requireHouse` is not enough — it proves the
   * caller sits somewhere, not that the row they named sits with them.
   */
  const REQUIRED_GUARDS = {
    saveDeal: "assertDealInHouse",
    addWorkstream: "assertDealInHouse",
    saveMeeting: "assertMeetingInHouse",
    updateMeetingRoom: "assertMeetingInHouse",
    setAttendance: "assertMeetingInHouse",
    addRoomNote: "assertMeetingInHouse",
    listRoomNotes: "assertMeetingInHouse",
    listAttendance: "assertMeetingInHouse",
    saveAlert: "assertDealInHouse",
    savePortfolio: "assertCompanyInHouse",
  };

  /** Source of one `export const <name> = createServerFn(...)` block. */
  function serverFnBody(name) {
    const start = houseSource.indexOf(`export const ${name} = createServerFn`);
    assert.notEqual(start, -1, `${name} is no longer exported from house.ts`);
    const next = houseSource.indexOf("\nexport const ", start + 1);
    return houseSource.slice(start, next === -1 ? houseSource.length : next);
  }

  for (const [fn, guard] of Object.entries(REQUIRED_GUARDS)) {
    test(`${fn} calls ${guard}`, () => {
      assert.match(
        serverFnBody(fn),
        new RegExp(`${guard}\\(`),
        `${fn} accepts a caller-supplied id but never checks it belongs to the caller's house. ` +
          `Add ${guard}(sql, houseId, <id>) before the query — see SCOPE.md § 6.`,
      );
    });
  }

  test("every house server function establishes a house first", () => {
    const names = [...houseSource.matchAll(/export const (\w+) = createServerFn/g)].map(
      (m) => m[1],
    );
    // loadHouse and createHouse run before/without a membership by design;
    // leaveHouse resolves its own. Everything else must require a seat.
    const exempt = new Set(["loadHouse", "createHouse", "joinHouse", "leaveHouse"]);
    assert.ok(names.length >= 10, "expected the house to expose its server functions");
    for (const name of names) {
      if (exempt.has(name)) continue;
      assert.match(
        serverFnBody(name),
        /requireHouse\(/,
        `${name} touches house data without requiring a seat — see SCOPE.md § 6.`,
      );
    }
  });
});

describe("excluded systems stay excluded (SCOPE.md)", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

  /** Dependency name fragments that would mean a boundary has been crossed. */
  const FORBIDDEN = [
    [/exceljs|xlsx|sheetjs|pptxgen|officegen|docx/i, "§ 2 no Excel or PowerPoint out"],
    [/nodemailer|@sendgrid|postmark|resend|mailgun/i, "§ 5 no email"],
    [/googleapis|ical|node-ical|@microsoft\/microsoft-graph/i, "§ 5 no calendar"],
    [/twilio|@zoom|agora-rtc|livekit/i, "§ 5 no Zoom"],
  ];

  for (const [pattern, rule] of FORBIDDEN) {
    test(`no dependency matching ${pattern.source}`, () => {
      const hit = deps.find((d) => pattern.test(d));
      assert.equal(
        hit,
        undefined,
        `${hit} crosses a scope boundary (SCOPE.md ${rule}). Change SCOPE.md first if that is intended.`,
      );
    });
  }

  test("no migration stores a document or file blob", () => {
    const dir = join(root, "migrations");
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql"))) {
      const sql = readFileSync(join(dir, name), "utf8");
      assert.doesNotMatch(
        sql,
        /\b(bytea|blob|oid)\b/i,
        `${name} adds binary storage — Atrium holds no documents (SCOPE.md § 1).`,
      );
    }
  });
});
