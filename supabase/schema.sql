-- Run this in Supabase SQL Editor. All personal rows are protected by RLS.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  default_servings integer not null default 2 check (default_servings between 1 and 12),
  favorite_cuisine text not null default 'Indian',
  dietary_preferences text[] not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe jsonb not null,
  viewed_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  quantity numeric not null check (quantity >= 0),
  unit text not null default 'pieces',
  purchase_date date,
  expiry_date date,
  category text not null default 'Pantry',
  storage_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.pantry_items enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
drop policy if exists "Users manage their saved recipes" on public.saved_recipes;
drop policy if exists "Users manage their favorites" on public.favorites;
drop policy if exists "Users manage their recent recipes" on public.recently_viewed;
drop policy if exists "Users manage their pantry" on public.pantry_items;
create policy "Users manage their own profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users manage their saved recipes" on public.saved_recipes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their favorites" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their recent recipes" on public.recently_viewed for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their pantry" on public.pantry_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists saved_recipes_user_created on public.saved_recipes (user_id, created_at desc);
create index if not exists favorites_user_created on public.favorites (user_id, created_at desc);
create index if not exists recently_viewed_user_time on public.recently_viewed (user_id, viewed_at desc);
create index if not exists pantry_items_user_expiry on public.pantry_items (user_id, expiry_date);
