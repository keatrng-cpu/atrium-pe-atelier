create table if not exists houses (
  id           text primary key,
  name         text not null,
  thesis       text not null default '',
  mandate      text not null default '',
  invite_code  text not null unique,
  created_by   text not null,
  created_at   timestamptz not null default now()
);

create table if not exists house_members (
  house_id     text not null references houses(id) on delete cascade,
  user_id      text not null,
  seat         text not null,
  fn           text not null,
  title        text not null default '',
  given_name   text not null default '',
  last_seen    timestamptz,
  joined_at    timestamptz not null default now(),
  primary key (house_id, user_id)
);
create index if not exists house_members_user_idx on house_members (user_id);

create table if not exists house_deals (
  id                text primary key,
  house_id          text not null references houses(id) on delete cascade,
  name              text not null,
  sector            text not null default '',
  stage             text not null default 'sourcing',
  enterprise_value  text not null default '',
  owner_id          text not null default '',
  next_action       text not null default '',
  due_on            text not null default '',
  thesis            text not null default '',
  created_at        timestamptz not null default now()
);
create index if not exists house_deals_house_idx on house_deals (house_id);

create table if not exists house_workstreams (
  id         text primary key,
  house_id   text not null references houses(id) on delete cascade,
  deal_id    text not null references house_deals(id) on delete cascade,
  title      text not null,
  owner_id   text not null default '',
  status     text not null default 'open',
  due_on     text not null default ''
);

create table if not exists house_meetings (
  id          text primary key,
  house_id    text not null references houses(id) on delete cascade,
  kind        text not null default 'pipeline',
  title       text not null,
  starts_at   text not null default '',
  location    text not null default 'Boardroom',
  agenda      text not null default '',
  minutes     text not null default '',
  decision    text not null default '',
  chair_id    text not null default '',
  deal_id     text not null default '',
  status      text not null default 'scheduled',
  created_at  timestamptz not null default now()
);
create index if not exists house_meetings_house_idx on house_meetings (house_id);

create table if not exists house_attendance (
  meeting_id  text not null references house_meetings(id) on delete cascade,
  user_id     text not null,
  status      text not null default 'invited',
  primary key (meeting_id, user_id)
);

create table if not exists house_room_notes (
  id          text primary key,
  meeting_id  text not null references house_meetings(id) on delete cascade,
  user_id     text not null,
  author      text not null default '',
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists house_alerts (
  id          text primary key,
  house_id    text not null references houses(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text not null default '',
  severity    text not null default 'watch',
  due_on      text not null default '',
  deal_id     text not null default '',
  meeting_id  text not null default '',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists house_alerts_house_idx on house_alerts (house_id, created_at desc);

create table if not exists house_portfolio (
  id           text primary key,
  house_id     text not null references houses(id) on delete cascade,
  name         text not null,
  sector       text not null default '',
  entry_year   text not null default '',
  owner_id     text not null default '',
  kpi_note     text not null default '',
  health       text not null default 'on-plan',
  next_board   text not null default ''
);
