-- Выполни этот SQL в Supabase → SQL Editor.
-- Затем в Authentication → Users создай пользователя администратора вручную.
-- Отключи публичную регистрацию пользователей в Authentication settings.
create extension if not exists pgcrypto;

create table if not exists public.portfolio_projects (
  id text primary key default ('custom-' || replace(gen_random_uuid()::text, '-', '')),
  title text not null,
  date text not null default '',
  description text not null default '',
  colors jsonb not null default '["#C6FF00","#141414","#F2F2F2"]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_works (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.portfolio_projects(id) on delete cascade,
  title text not null default '',
  file_name text not null default '',
  image_url text not null,
  width integer not null default 1200,
  height integer not null default 800,
  format text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Explicit admin allowlist. Only SQL Editor / server administrators may modify it.
create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())); $$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

-- Idempotent migration for existing installations.
alter table public.portfolio_projects add column if not exists title_en text not null default '';
alter table public.portfolio_projects add column if not exists date_en text not null default '';
alter table public.portfolio_projects add column if not exists description_en text not null default '';
alter table public.portfolio_works add column if not exists title_en text not null default '';
grant select on public.portfolio_projects, public.portfolio_works to anon;
grant select, insert, update, delete on public.portfolio_projects, public.portfolio_works to authenticated;

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_works enable row level security;

drop policy if exists "Public can read portfolio projects" on public.portfolio_projects;
create policy "Public can read portfolio projects"
on public.portfolio_projects for select using (true);

drop policy if exists "Authenticated users can manage portfolio projects" on public.portfolio_projects;
create policy "Authenticated users can manage portfolio projects"
on public.portfolio_projects for all to authenticated
using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read portfolio works" on public.portfolio_works;
create policy "Public can read portfolio works"
on public.portfolio_works for select using (true);

drop policy if exists "Authenticated users can manage portfolio works" on public.portfolio_works;
create policy "Authenticated users can manage portfolio works"
on public.portfolio_works for all to authenticated
using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 12582912,
        array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 12582912,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];

drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images"
on storage.objects for select using (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated users can upload portfolio images" on storage.objects;
create policy "Authenticated users can upload portfolio images"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-images' and (select public.is_portfolio_admin()));

drop policy if exists "Authenticated users can update portfolio images" on storage.objects;
create policy "Authenticated users can update portfolio images"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio-images' and (select public.is_portfolio_admin())) with check (bucket_id = 'portfolio-images' and (select public.is_portfolio_admin()));

drop policy if exists "Authenticated users can delete portfolio images" on storage.objects;
create policy "Authenticated users can delete portfolio images"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-images' and (select public.is_portfolio_admin()));

-- Скрытые архивные работы (из assets/works.js). Файлы остаются в репозитории,
-- но сайт их не показывает. src — путь вида assets/works/gnc-sep-2026/01.webp.
create table if not exists public.portfolio_hidden_works (
  src text primary key,
  created_at timestamptz not null default now()
);
grant select on public.portfolio_hidden_works to anon;
grant select, insert, update, delete on public.portfolio_hidden_works to authenticated;
alter table public.portfolio_hidden_works enable row level security;

drop policy if exists "Public can read hidden works" on public.portfolio_hidden_works;
create policy "Public can read hidden works"
on public.portfolio_hidden_works for select using (true);

drop policy if exists "Admins can manage hidden works" on public.portfolio_hidden_works;
create policy "Admins can manage hidden works"
on public.portfolio_hidden_works for all to authenticated
using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));
