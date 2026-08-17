-- Demo-seed marking for house books.
--
-- A new house opens with a demo pipeline so the room is not empty (SCOPE.md
-- § "House books seed a demo pipeline"). Rows written by `seedHouse()` carry
-- `seeded = true` so the floor can label them as demo and a house can clear
-- them in one action once its own work lands. Member-authored rows are always
-- false, which is the default — so this is safe to apply to existing houses:
-- everything already on the book reads as real work.
--
-- Workstreams, attendance, and room notes hang off their parent deal/meeting
-- with `on delete cascade`, so clearing a seeded deal or meeting takes its
-- children with it. `house_workstreams` still carries the flag because a demo
-- deal's workstreams are seeded too and the column keeps that legible.

alter table house_deals       add column if not exists seeded boolean not null default false;
alter table house_workstreams add column if not exists seeded boolean not null default false;
alter table house_meetings    add column if not exists seeded boolean not null default false;
alter table house_alerts      add column if not exists seeded boolean not null default false;
alter table house_portfolio   add column if not exists seeded boolean not null default false;
