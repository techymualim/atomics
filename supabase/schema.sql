-- Supabase schema for Atomics
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Atomics table: each swap the user is installing
create table if not exists atomics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,
  name text not null,
  trigger text not null default 'When the moment comes',
  old_behavior text not null default 'The old default',
  new_behavior text not null,
  note text default '',
  graduated boolean default false,
  graduated_at timestamptz,
  is_active boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Logs table: daily check-ins per atomic
create table if not exists logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  atomic_id uuid references atomics(id) on delete cascade not null,
  date date not null,
  status text check (status in ('ran', 'missed')),
  bad_day boolean default false,
  note text default '',
  created_at timestamptz default now(),
  unique(atomic_id, date)
);

-- Indexes
create index if not exists idx_atomics_user on atomics(user_id);
create index if not exists idx_logs_user on logs(user_id);
create index if not exists idx_logs_atomic on logs(atomic_id);
create index if not exists idx_logs_date on logs(date);

-- Row Level Security
alter table atomics enable row level security;
alter table logs enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own atomics"
  on atomics for select
  using (auth.uid() = user_id);

create policy "Users can insert own atomics"
  on atomics for insert
  with check (auth.uid() = user_id);

create policy "Users can update own atomics"
  on atomics for update
  using (auth.uid() = user_id);

create policy "Users can delete own atomics"
  on atomics for delete
  using (auth.uid() = user_id);

create policy "Users can view own logs"
  on logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on logs for delete
  using (auth.uid() = user_id);
