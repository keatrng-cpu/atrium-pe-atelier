-- Row-level security on every application table.
--
-- WHY THIS EXISTS. Atrium scopes every query to the caller server-side (see
-- `authMiddleware` + `requireUserId`), which is sufficient when the database is
-- reachable only by this app — the Neon/PGLite assumption the rest of the schema
-- was written under. Supabase is different: it publishes the `public` schema
-- through PostgREST, and the project's publishable (anon) key is public by
-- design. Without RLS, anyone holding that key could read and write every table
-- directly, bypassing the server entirely — including `member_profile` (goals,
-- struggles, birthday), `counsel_turns`, `research_briefs`, every house book,
-- and worst of all Better Auth's `session` (live session tokens), `account`
-- (password hashes and encrypted OAuth tokens), and `user`.
--
-- HOW THIS WORKS. Enabling RLS with NO policies denies all access to the roles
-- PostgREST uses (`anon`, `authenticated`). The app is unaffected: it connects
-- over `DATABASE_URL` as the table owner, and an owner bypasses RLS unless the
-- table is set to FORCE — which is deliberately not done here. So this closes
-- the public API surface without adding a second authorization model to keep in
-- sync with the server-side one. The server remains the only way in.
--
-- IF YOU ADD A TABLE. New tables are NOT covered — this migration ran once, over
-- the tables that existed then. Either add `alter table <name> enable row level
-- security;` to the migration that creates it, or re-run this block in a new
-- migration. A table in `public` without RLS is a table published to the
-- internet.

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end
$$;
