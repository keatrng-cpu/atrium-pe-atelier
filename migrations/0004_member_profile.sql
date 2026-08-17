create table if not exists member_profile (
  user_id      text primary key,
  given_name   text not null default '',
  job_level    text not null default '',
  birthday     text not null default '',
  company      text not null default '',
  goals        text not null default '',
  struggles    text not null default '',
  strengths    text not null default '',
  education    text not null default '',
  experience   text not null default '',
  updated_at   timestamptz not null default now()
);
