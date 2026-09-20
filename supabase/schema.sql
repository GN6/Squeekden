-- Run once in Supabase SQL Editor. Supabase Auth manages user identities/passwords.
create table if not exists public.rat_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists rat_profiles_user_created_idx on public.rat_profiles(user_id,created_at desc);
alter table public.rat_profiles enable row level security;
create policy "Read own rats" on public.rat_profiles for select to authenticated using (auth.uid() = user_id);
create policy "Create own rats" on public.rat_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Delete own rats" on public.rat_profiles for delete to authenticated using (auth.uid() = user_id);
