create table if not exists research_briefs (
  id              text primary key,
  user_id         text not null,
  kind            text not null,
  query           text not null,
  ticker          text not null default '',
  title           text not null default '',
  subject         text not null default '',
  verdict         text not null default '',
  thesis          text not null default '',
  body_json       text not null default '{}',
  citations_json  text not null default '[]',
  market_json     text not null default 'null',
  review_json     text not null default '{}',
  status          text not null default 'reviewed',
  created_at      timestamptz not null default now(),
  published_at    timestamptz
);
create index if not exists research_briefs_user_idx on research_briefs (user_id, created_at desc);
