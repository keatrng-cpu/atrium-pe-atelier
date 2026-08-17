create table if not exists work_products (
  id          text primary key,
  user_id     text not null,
  kind        text not null,
  title       text not null,
  input_json  text not null default '{}',
  output_json text not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists work_products_user_id_idx on work_products (user_id, created_at desc);

create table if not exists counsel_turns (
  id          text primary key,
  user_id     text not null,
  rank_id     text not null,
  role        text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists counsel_turns_user_id_idx on counsel_turns (user_id, created_at desc);
