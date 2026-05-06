-- NammaPoruppu initial schema (no-login friendly flow)
-- Run this in Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------- Cities ----------
create table if not exists public.cities (
  id text primary key,
  name text not null,
  state text not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.cities (id, name, state, active)
values
  ('chennai', 'Chennai', 'Tamil Nadu', true),
  ('coimbatore', 'Coimbatore', 'Tamil Nadu', false),
  ('madurai', 'Madurai', 'Tamil Nadu', false)
on conflict (id) do update set
  name = excluded.name,
  state = excluded.state,
  active = excluded.active;

-- ---------- Wards ----------
create table if not exists public.wards (
  id text primary key,
  city_id text not null references public.cities(id) on delete cascade,
  ward_number int not null,
  ward_name text not null,
  zone_name text not null,
  assembly_constituency text,
  created_at timestamptz not null default now()
);

create unique index if not exists wards_city_ward_number_idx on public.wards(city_id, ward_number);

-- ---------- Representatives ----------
create table if not exists public.representatives (
  id text primary key,
  ward_id text not null references public.wards(id) on delete cascade,
  name text not null,
  role text not null
    check (role in ('Councillor', 'MLA', 'MP', 'ZonalOfficer', 'WardEngineer', 'SanitaryInspector')),
  area text not null,
  constituency text,
  party text,
  party_color text,
  photo_url text,
  email text not null,
  helpline text not null,
  office_hours text not null,
  preferred_channel text not null
    check (preferred_channel in ('email', 'phone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Usually one official per role in a ward in this app model.
create unique index if not exists representatives_ward_role_idx
  on public.representatives(ward_id, role);
create index if not exists representatives_ward_idx
  on public.representatives(ward_id);

-- ---------- Reports ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_ref text unique not null,

  city_id text not null references public.cities(id),
  ward_id text not null references public.wards(id),

  category text not null,
  description text,

  status text not null default 'open'
    check (status in ('open', 'pending_verification', 'resolved')),

  -- Human-friendly address
  display_address text not null,
  street text,
  neighbourhood text,
  postcode text,

  -- Machine coordinates
  lat double precision not null,
  lng double precision not null,
  accuracy_meters double precision,

  support_count int not null default 0,

  reporter_session_id text not null,
  reporter_user_id uuid references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_city_idx on public.reports(city_id);
create index if not exists reports_ward_idx on public.reports(ward_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_created_idx on public.reports(created_at desc);

-- ---------- Report images ----------
create table if not exists public.report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  image_url text not null,
  image_kind text not null default 'report' check (image_kind in ('report', 'resolve_proof')),
  created_at timestamptz not null default now()
);

create index if not exists report_images_report_idx on public.report_images(report_id);

-- ---------- Resolve proofs ----------
create table if not exists public.resolve_proofs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  proof_image_url text not null,
  note text,

  lat double precision,
  lng double precision,
  accuracy_meters double precision,

  verifier_session_id text not null,
  verifier_user_id uuid references auth.users(id),

  verified boolean not null default false,
  verified_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists resolve_proofs_report_idx on public.resolve_proofs(report_id);

-- ---------- Supports (upvotes) ----------
create table if not exists public.report_supports (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  supporter_session_id text not null,
  supporter_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (report_id, supporter_session_id)
);

create index if not exists report_supports_report_idx on public.report_supports(report_id);

-- ---------- Triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.sync_report_support_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.reports set support_count = support_count + 1 where id = new.report_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.reports set support_count = greatest(0, support_count - 1) where id = old.report_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists report_supports_inc on public.report_supports;
create trigger report_supports_inc
after insert on public.report_supports
for each row execute function public.sync_report_support_count();

drop trigger if exists report_supports_dec on public.report_supports;
create trigger report_supports_dec
after delete on public.report_supports
for each row execute function public.sync_report_support_count();

-- If a proof is inserted, report goes pending_verification.
create or replace function public.on_resolve_proof_insert()
returns trigger language plpgsql as $$
begin
  update public.reports
  set status = 'pending_verification'
  where id = new.report_id
    and status <> 'resolved';
  return new;
end;
$$;

drop trigger if exists resolve_proof_pending on public.resolve_proofs;
create trigger resolve_proof_pending
after insert on public.resolve_proofs
for each row execute function public.on_resolve_proof_insert();

-- ---------- RLS ----------
alter table public.cities enable row level security;
alter table public.wards enable row level security;
alter table public.representatives enable row level security;
alter table public.reports enable row level security;
alter table public.report_images enable row level security;
alter table public.resolve_proofs enable row level security;
alter table public.report_supports enable row level security;

-- Public read access for browse/map.
drop policy if exists cities_public_read on public.cities;
create policy cities_public_read on public.cities
for select using (true);

drop policy if exists wards_public_read on public.wards;
create policy wards_public_read on public.wards
for select using (true);

drop policy if exists representatives_public_read on public.representatives;
create policy representatives_public_read on public.representatives
for select using (true);

drop policy if exists reports_public_read on public.reports;
create policy reports_public_read on public.reports
for select using (true);

drop policy if exists report_images_public_read on public.report_images;
create policy report_images_public_read on public.report_images
for select using (true);

drop policy if exists proofs_public_read on public.resolve_proofs;
create policy proofs_public_read on public.resolve_proofs
for select using (true);

drop policy if exists supports_public_read on public.report_supports;
create policy supports_public_read on public.report_supports
for select using (true);

-- No-login friendly inserts (anon + authenticated).
drop policy if exists reports_public_insert on public.reports;
create policy reports_public_insert on public.reports
for insert with check (true);

drop policy if exists report_images_public_insert on public.report_images;
create policy report_images_public_insert on public.report_images
for insert with check (true);

drop policy if exists proofs_public_insert on public.resolve_proofs;
create policy proofs_public_insert on public.resolve_proofs
for insert with check (true);

drop policy if exists supports_public_insert on public.report_supports;
create policy supports_public_insert on public.report_supports
for insert with check (true);

-- Representatives are managed by trusted operators/admin flows.
drop policy if exists representatives_auth_insert on public.representatives;
create policy representatives_auth_insert on public.representatives
for insert to authenticated
with check (true);

drop policy if exists representatives_auth_update on public.representatives;
create policy representatives_auth_update on public.representatives
for update to authenticated
using (true)
with check (true);

drop policy if exists representatives_auth_delete on public.representatives;
create policy representatives_auth_delete on public.representatives
for delete to authenticated
using (true);

-- Restrict direct status updates to authenticated users (future moderation/admin flows).
drop policy if exists reports_auth_update on public.reports;
create policy reports_auth_update on public.reports
for update to authenticated
using (true)
with check (true);
