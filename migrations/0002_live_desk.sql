create table if not exists store_orders (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
