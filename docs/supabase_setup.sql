-- DocuMind — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ── Profiles table ────────────────────────────────────────────────────────────
-- Automatically created when a user signs up (via trigger below)

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger fires after a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Analysis history table (optional — stores past analyses) ──────────────────
create table if not exists public.analyses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  filename      text not null,
  doc_type      text,
  pages         integer,
  word_count    integer,
  summary_exec  text,
  summary_std   text,
  summary_det   text,
  created_at    timestamptz default now()
);

alter table public.analyses enable row level security;

drop policy if exists "Users can view own analyses" on public.analyses;
drop policy if exists "Users can insert own analyses" on public.analyses;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);
