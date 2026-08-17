create table if not exists correspondence (
  id          text primary key,
  user_id     text not null,
  letter_key  text not null,
  subject     text not null,
  opened_at   timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, letter_key)
);
create index if not exists correspondence_user_id_idx on correspondence (user_id);

create table if not exists mastery_progress (
  user_id     text not null,
  skill_id    text not null,
  status      text not null default 'unstarted',
  notes       text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table if not exists studio_profile (
  user_id       text primary key,
  target_rank   text not null default 'analyst',
  firm_tier     text not null default 'umm',
  deal_log      text not null default '',
  updated_at    timestamptz not null default now()
);
