-- Merged bootstrap migration for Chennai setup.
-- Run this after 001_init.sql.
-- Includes: ward seed, storage bucket, locality schema/import helper,
-- auth-enforced upvotes, escalation schema and owner delete policy.

insert into public.wards (id, city_id, ward_number, ward_name, zone_name, assembly_constituency)
values
  ('ward-001', 'chennai', 1, 'Ward 1', 'Zone Thiruvottiyur', null),
  ('ward-002', 'chennai', 2, 'Ward 2', 'Zone Thiruvottiyur', null),
  ('ward-003', 'chennai', 3, 'Ward 3', 'Zone Thiruvottiyur', null),
  ('ward-004', 'chennai', 4, 'Ward 4', 'Zone Thiruvottiyur', null),
  ('ward-005', 'chennai', 5, 'Ward 5', 'Zone Thiruvottiyur', null),
  ('ward-006', 'chennai', 6, 'Ward 6', 'Zone Thiruvottiyur', null),
  ('ward-007', 'chennai', 7, 'Ward 7', 'Zone Thiruvottiyur', null),
  ('ward-008', 'chennai', 8, 'Ward 8', 'Zone Thiruvottiyur', null),
  ('ward-009', 'chennai', 9, 'Ward 9', 'Zone Thiruvottiyur', null),
  ('ward-010', 'chennai', 10, 'Ward 10', 'Zone Thiruvottiyur', null),
  ('ward-011', 'chennai', 11, 'Ward 11', 'Zone Thiruvottiyur', null),
  ('ward-012', 'chennai', 12, 'Ward 12', 'Zone Thiruvottiyur', null),
  ('ward-013', 'chennai', 13, 'Ward 13', 'Zone Thiruvottiyur', null),
  ('ward-014', 'chennai', 14, 'Ward 14', 'Zone Thiruvottiyur', null),
  ('ward-015', 'chennai', 15, 'Ward 15', 'Zone Manali', null),
  ('ward-016', 'chennai', 16, 'Ward 16', 'Zone Manali', null),
  ('ward-017', 'chennai', 17, 'Ward 17', 'Zone Manali', null),
  ('ward-018', 'chennai', 18, 'Ward 18', 'Zone Manali', null),
  ('ward-019', 'chennai', 19, 'Ward 19', 'Zone Manali', null),
  ('ward-020', 'chennai', 20, 'Ward 20', 'Zone Manali', null),
  ('ward-021', 'chennai', 21, 'Ward 21', 'Zone Manali', null),
  ('ward-022', 'chennai', 22, 'Ward 22', 'Zone Madhavaram', null),
  ('ward-023', 'chennai', 23, 'Ward 23', 'Zone Madhavaram', null),
  ('ward-024', 'chennai', 24, 'Ward 24', 'Zone Madhavaram', null),
  ('ward-025', 'chennai', 25, 'Ward 25', 'Zone Madhavaram', null),
  ('ward-026', 'chennai', 26, 'Ward 26', 'Zone Madhavaram', null),
  ('ward-027', 'chennai', 27, 'Ward 27', 'Zone Madhavaram', null),
  ('ward-028', 'chennai', 28, 'Ward 28', 'Zone Madhavaram', null),
  ('ward-029', 'chennai', 29, 'Ward 29', 'Zone Madhavaram', null),
  ('ward-030', 'chennai', 30, 'Ward 30', 'Zone Madhavaram', null),
  ('ward-031', 'chennai', 31, 'Ward 31', 'Zone Madhavaram', null),
  ('ward-032', 'chennai', 32, 'Ward 32', 'Zone Madhavaram', null),
  ('ward-033', 'chennai', 33, 'Ward 33', 'Zone Madhavaram', null),
  ('ward-034', 'chennai', 34, 'Ward 34', 'Zone Tondiarpet', null),
  ('ward-035', 'chennai', 35, 'Ward 35', 'Zone Tondiarpet', null),
  ('ward-036', 'chennai', 36, 'Ward 36', 'Zone Tondiarpet', null),
  ('ward-037', 'chennai', 37, 'Ward 37', 'Zone Tondiarpet', null),
  ('ward-038', 'chennai', 38, 'Ward 38', 'Zone Tondiarpet', null),
  ('ward-039', 'chennai', 39, 'Ward 39', 'Zone Tondiarpet', null),
  ('ward-040', 'chennai', 40, 'Ward 40', 'Zone Tondiarpet', null),
  ('ward-041', 'chennai', 41, 'Ward 41', 'Zone Tondiarpet', null),
  ('ward-042', 'chennai', 42, 'Ward 42', 'Zone Tondiarpet', null),
  ('ward-043', 'chennai', 43, 'Ward 43', 'Zone Tondiarpet', null),
  ('ward-044', 'chennai', 44, 'Ward 44', 'Zone Tondiarpet', null),
  ('ward-045', 'chennai', 45, 'Ward 45', 'Zone Tondiarpet', null),
  ('ward-046', 'chennai', 46, 'Ward 46', 'Zone Tondiarpet', null),
  ('ward-047', 'chennai', 47, 'Ward 47', 'Zone Tondiarpet', null),
  ('ward-048', 'chennai', 48, 'Ward 48', 'Zone Tondiarpet', null),
  ('ward-049', 'chennai', 49, 'Ward 49', 'Zone Royapuram', null),
  ('ward-050', 'chennai', 50, 'Ward 50', 'Zone Royapuram', null),
  ('ward-051', 'chennai', 51, 'Ward 51', 'Zone Royapuram', null),
  ('ward-052', 'chennai', 52, 'Ward 52', 'Zone Royapuram', null),
  ('ward-053', 'chennai', 53, 'Ward 53', 'Zone Royapuram', null),
  ('ward-054', 'chennai', 54, 'Ward 54', 'Zone Royapuram', null),
  ('ward-055', 'chennai', 55, 'Ward 55', 'Zone Royapuram', null),
  ('ward-056', 'chennai', 56, 'Ward 56', 'Zone Royapuram', null),
  ('ward-057', 'chennai', 57, 'Ward 57', 'Zone Royapuram', null),
  ('ward-058', 'chennai', 58, 'Ward 58', 'Zone Royapuram', null),
  ('ward-059', 'chennai', 59, 'Ward 59', 'Zone Royapuram', null),
  ('ward-060', 'chennai', 60, 'Ward 60', 'Zone Royapuram', null),
  ('ward-061', 'chennai', 61, 'Ward 61', 'Zone Royapuram', null),
  ('ward-062', 'chennai', 62, 'Ward 62', 'Zone Royapuram', null),
  ('ward-063', 'chennai', 63, 'Ward 63', 'Zone Royapuram', null),
  ('ward-064', 'chennai', 64, 'Ward 64', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-065', 'chennai', 65, 'Ward 65', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-066', 'chennai', 66, 'Ward 66', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-067', 'chennai', 67, 'Ward 67', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-068', 'chennai', 68, 'Ward 68', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-069', 'chennai', 69, 'Ward 69', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-070', 'chennai', 70, 'Ward 70', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-071', 'chennai', 71, 'Ward 71', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-072', 'chennai', 72, 'Ward 72', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-073', 'chennai', 73, 'Ward 73', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-074', 'chennai', 74, 'Ward 74', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-075', 'chennai', 75, 'Ward 75', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-076', 'chennai', 76, 'Ward 76', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-077', 'chennai', 77, 'Ward 77', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-078', 'chennai', 78, 'Ward 78', 'Zone Thiru-vi-ka-nagar', null),
  ('ward-079', 'chennai', 79, 'Ward 79', 'Zone Ambattur', null),
  ('ward-080', 'chennai', 80, 'Ward 80', 'Zone Ambattur', null),
  ('ward-081', 'chennai', 81, 'Ward 81', 'Zone Ambattur', null),
  ('ward-082', 'chennai', 82, 'Ward 82', 'Zone Ambattur', null),
  ('ward-083', 'chennai', 83, 'Ward 83', 'Zone Ambattur', null),
  ('ward-084', 'chennai', 84, 'Ward 84', 'Zone Ambattur', null),
  ('ward-085', 'chennai', 85, 'Ward 85', 'Zone Ambattur', null),
  ('ward-086', 'chennai', 86, 'Ward 86', 'Zone Ambattur', null),
  ('ward-087', 'chennai', 87, 'Ward 87', 'Zone Ambattur', null),
  ('ward-088', 'chennai', 88, 'Ward 88', 'Zone Ambattur', null),
  ('ward-089', 'chennai', 89, 'Ward 89', 'Zone Ambattur', null),
  ('ward-090', 'chennai', 90, 'Ward 90', 'Zone Ambattur', null),
  ('ward-091', 'chennai', 91, 'Ward 91', 'Zone Ambattur', null),
  ('ward-092', 'chennai', 92, 'Ward 92', 'Zone Ambattur', null),
  ('ward-093', 'chennai', 93, 'Ward 93', 'Zone Ambattur', null),
  ('ward-094', 'chennai', 94, 'Ward 94', 'Zone Annanagar', null),
  ('ward-095', 'chennai', 95, 'Ward 95', 'Zone Annanagar', null),
  ('ward-096', 'chennai', 96, 'Ward 96', 'Zone Annanagar', null),
  ('ward-097', 'chennai', 97, 'Ward 97', 'Zone Annanagar', null),
  ('ward-098', 'chennai', 98, 'Ward 98', 'Zone Annanagar', null),
  ('ward-099', 'chennai', 99, 'Ward 99', 'Zone Annanagar', null),
  ('ward-100', 'chennai', 100, 'Ward 100', 'Zone Annanagar', null),
  ('ward-101', 'chennai', 101, 'Ward 101', 'Zone Annanagar', null),
  ('ward-102', 'chennai', 102, 'Ward 102', 'Zone Annanagar', null),
  ('ward-103', 'chennai', 103, 'Ward 103', 'Zone Annanagar', null),
  ('ward-104', 'chennai', 104, 'Ward 104', 'Zone Annanagar', null),
  ('ward-105', 'chennai', 105, 'Ward 105', 'Zone Annanagar', null),
  ('ward-106', 'chennai', 106, 'Ward 106', 'Zone Annanagar', null),
  ('ward-107', 'chennai', 107, 'Ward 107', 'Zone Annanagar', null),
  ('ward-108', 'chennai', 108, 'Ward 108', 'Zone Annanagar', null),
  ('ward-109', 'chennai', 109, 'Ward 109', 'Zone Teynampet', null),
  ('ward-110', 'chennai', 110, 'Ward 110', 'Zone Teynampet', null),
  ('ward-111', 'chennai', 111, 'Ward 111', 'Zone Teynampet', null),
  ('ward-112', 'chennai', 112, 'Ward 112', 'Zone Teynampet', null),
  ('ward-113', 'chennai', 113, 'Ward 113', 'Zone Teynampet', null),
  ('ward-114', 'chennai', 114, 'Ward 114', 'Zone Teynampet', null),
  ('ward-115', 'chennai', 115, 'Ward 115', 'Zone Teynampet', null),
  ('ward-116', 'chennai', 116, 'Ward 116', 'Zone Teynampet', null),
  ('ward-117', 'chennai', 117, 'Ward 117', 'Zone Teynampet', null),
  ('ward-118', 'chennai', 118, 'Ward 118', 'Zone Teynampet', null),
  ('ward-119', 'chennai', 119, 'Ward 119', 'Zone Teynampet', null),
  ('ward-120', 'chennai', 120, 'Ward 120', 'Zone Teynampet', null),
  ('ward-121', 'chennai', 121, 'Ward 121', 'Zone Teynampet', null),
  ('ward-122', 'chennai', 122, 'Ward 122', 'Zone Teynampet', null),
  ('ward-123', 'chennai', 123, 'Ward 123', 'Zone Teynampet', null),
  ('ward-124', 'chennai', 124, 'Ward 124', 'Zone Teynampet', null),
  ('ward-125', 'chennai', 125, 'Ward 125', 'Zone Teynampet', null),
  ('ward-126', 'chennai', 126, 'Ward 126', 'Zone Teynampet', null),
  ('ward-127', 'chennai', 127, 'Ward 127', 'Zone Kodambakkam', null),
  ('ward-128', 'chennai', 128, 'Ward 128', 'Zone Kodambakkam', null),
  ('ward-129', 'chennai', 129, 'Ward 129', 'Zone Kodambakkam', null),
  ('ward-130', 'chennai', 130, 'Ward 130', 'Zone Kodambakkam', null),
  ('ward-131', 'chennai', 131, 'Ward 131', 'Zone Kodambakkam', null),
  ('ward-132', 'chennai', 132, 'Ward 132', 'Zone Kodambakkam', null),
  ('ward-133', 'chennai', 133, 'Ward 133', 'Zone Kodambakkam', null),
  ('ward-134', 'chennai', 134, 'Ward 134', 'Zone Kodambakkam', null),
  ('ward-135', 'chennai', 135, 'Ward 135', 'Zone Kodambakkam', null),
  ('ward-136', 'chennai', 136, 'Ward 136', 'Zone Kodambakkam', null),
  ('ward-137', 'chennai', 137, 'Ward 137', 'Zone Kodambakkam', null),
  ('ward-138', 'chennai', 138, 'Ward 138', 'Zone Kodambakkam', null),
  ('ward-139', 'chennai', 139, 'Ward 139', 'Zone Kodambakkam', null),
  ('ward-140', 'chennai', 140, 'Ward 140', 'Zone Kodambakkam', null),
  ('ward-141', 'chennai', 141, 'Ward 141', 'Zone Kodambakkam', null),
  ('ward-142', 'chennai', 142, 'Ward 142', 'Zone Kodambakkam', null),
  ('ward-143', 'chennai', 143, 'Ward 143', 'Zone Valasaravakkam', null),
  ('ward-144', 'chennai', 144, 'Ward 144', 'Zone Valasaravakkam', null),
  ('ward-145', 'chennai', 145, 'Ward 145', 'Zone Valasaravakkam', null),
  ('ward-146', 'chennai', 146, 'Ward 146', 'Zone Valasaravakkam', null),
  ('ward-147', 'chennai', 147, 'Ward 147', 'Zone Valasaravakkam', null),
  ('ward-148', 'chennai', 148, 'Ward 148', 'Zone Valasaravakkam', null),
  ('ward-149', 'chennai', 149, 'Ward 149', 'Zone Valasaravakkam', null),
  ('ward-150', 'chennai', 150, 'Ward 150', 'Zone Valasaravakkam', null),
  ('ward-151', 'chennai', 151, 'Ward 151', 'Zone Valasaravakkam', null),
  ('ward-152', 'chennai', 152, 'Ward 152', 'Zone Valasaravakkam', null),
  ('ward-153', 'chennai', 153, 'Ward 153', 'Zone Valasaravakkam', null),
  ('ward-154', 'chennai', 154, 'Ward 154', 'Zone Valasaravakkam', null),
  ('ward-155', 'chennai', 155, 'Ward 155', 'Zone Valasaravakkam', null),
  ('ward-156', 'chennai', 156, 'Ward 156', 'Zone Alandur', null),
  ('ward-157', 'chennai', 157, 'Ward 157', 'Zone Alandur', null),
  ('ward-158', 'chennai', 158, 'Ward 158', 'Zone Alandur', null),
  ('ward-159', 'chennai', 159, 'Ward 159', 'Zone Alandur', null),
  ('ward-160', 'chennai', 160, 'Ward 160', 'Zone Alandur', null),
  ('ward-161', 'chennai', 161, 'Ward 161', 'Zone Alandur', null),
  ('ward-162', 'chennai', 162, 'Ward 162', 'Zone Alandur', null),
  ('ward-163', 'chennai', 163, 'Ward 163', 'Zone Alandur', null),
  ('ward-164', 'chennai', 164, 'Ward 164', 'Zone Alandur', null),
  ('ward-165', 'chennai', 165, 'Ward 165', 'Zone Alandur', null),
  ('ward-166', 'chennai', 166, 'Ward 166', 'Zone Alandur', null),
  ('ward-167', 'chennai', 167, 'Ward 167', 'Zone Alandur', null),
  ('ward-168', 'chennai', 168, 'Ward 168', 'Zone Perungudi', null),
  ('ward-169', 'chennai', 169, 'Ward 169', 'Zone Perungudi', null),
  ('ward-170', 'chennai', 170, 'Ward 170', 'Zone Adyar', null),
  ('ward-171', 'chennai', 171, 'Ward 171', 'Zone Adyar', null),
  ('ward-172', 'chennai', 172, 'Ward 172', 'Zone Adyar', null),
  ('ward-173', 'chennai', 173, 'Ward 173', 'Zone Adyar', null),
  ('ward-174', 'chennai', 174, 'Ward 174', 'Zone Adyar', null),
  ('ward-175', 'chennai', 175, 'Ward 175', 'Zone Adyar', null),
  ('ward-176', 'chennai', 176, 'Ward 176', 'Zone Adyar', null),
  ('ward-177', 'chennai', 177, 'Ward 177', 'Zone Adyar', null),
  ('ward-178', 'chennai', 178, 'Ward 178', 'Zone Adyar', null),
  ('ward-179', 'chennai', 179, 'Ward 179', 'Zone Adyar', null),
  ('ward-180', 'chennai', 180, 'Ward 180', 'Zone Adyar', null),
  ('ward-181', 'chennai', 181, 'Ward 181', 'Zone Adyar', null),
  ('ward-182', 'chennai', 182, 'Ward 182', 'Zone Adyar', null),
  ('ward-183', 'chennai', 183, 'Ward 183', 'Zone Perungudi', null),
  ('ward-184', 'chennai', 184, 'Ward 184', 'Zone Perungudi', null),
  ('ward-185', 'chennai', 185, 'Ward 185', 'Zone Perungudi', null),
  ('ward-186', 'chennai', 186, 'Ward 186', 'Zone Perungudi', null),
  ('ward-187', 'chennai', 187, 'Ward 187', 'Zone Perungudi', null),
  ('ward-188', 'chennai', 188, 'Ward 188', 'Zone Perungudi', null),
  ('ward-189', 'chennai', 189, 'Ward 189', 'Zone Perungudi', null),
  ('ward-190', 'chennai', 190, 'Ward 190', 'Zone Perungudi', null),
  ('ward-191', 'chennai', 191, 'Ward 191', 'Zone Perungudi', null),
  ('ward-192', 'chennai', 192, 'Ward 192', 'Zone Sozhinganallur', null),
  ('ward-193', 'chennai', 193, 'Ward 193', 'Zone Sozhinganallur', null),
  ('ward-194', 'chennai', 194, 'Ward 194', 'Zone Sozhinganallur', null),
  ('ward-195', 'chennai', 195, 'Ward 195', 'Zone Sozhinganallur', null),
  ('ward-196', 'chennai', 196, 'Ward 196', 'Zone Sozhinganallur', null),
  ('ward-197', 'chennai', 197, 'Ward 197', 'Zone Sozhinganallur', null),
  ('ward-198', 'chennai', 198, 'Ward 198', 'Zone Sozhinganallur', null),
  ('ward-199', 'chennai', 199, 'Ward 199', 'Zone Sozhinganallur', null),
  ('ward-200', 'chennai', 200, 'Ward 200', 'Zone Sozhinganallur', null)
on conflict (id) do update set
  city_id = excluded.city_id,
  ward_number = excluded.ward_number,
  ward_name = excluded.ward_name,
  zone_name = excluded.zone_name,
  assembly_constituency = coalesce(public.wards.assembly_constituency, excluded.assembly_constituency);

-- ---------- Storage bucket for report/proof images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-images',
  'report-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_report_images" on storage.objects;
create policy "public_read_report_images"
on storage.objects for select
using (bucket_id = 'report-images');

drop policy if exists "anon_insert_report_images" on storage.objects;
create policy "anon_insert_report_images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'report-images');

-- ---------- Locality -> ward mapping table ----------
create table if not exists public.ward_localities (
  id uuid primary key default gen_random_uuid(),
  city_id text not null references public.cities(id) on delete cascade,
  ward_id text not null references public.wards(id) on delete cascade,
  ward_number int not null,
  ward_name text not null,
  zone_name text not null,
  locality_name text not null,
  locality_name_norm text generated always as (regexp_replace(lower(locality_name), '[^a-z0-9]+', '', 'g')) stored,
  place_type text,
  osm_type text,
  osm_id text,
  lat double precision,
  lng double precision,
  source_name text,
  source_url text,
  is_verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ward_localities_city_idx on public.ward_localities(city_id);
create index if not exists ward_localities_ward_idx on public.ward_localities(ward_id);
create index if not exists ward_localities_locality_idx on public.ward_localities(locality_name);
create unique index if not exists ward_localities_unique_city_ward_locality_idx
  on public.ward_localities(city_id, ward_id, locality_name_norm);

drop trigger if exists ward_localities_set_updated_at on public.ward_localities;
create trigger ward_localities_set_updated_at
before update on public.ward_localities
for each row execute function public.set_updated_at();

alter table public.ward_localities enable row level security;

drop policy if exists ward_localities_public_read on public.ward_localities;
create policy ward_localities_public_read on public.ward_localities
for select using (true);

drop policy if exists ward_localities_auth_insert on public.ward_localities;
create policy ward_localities_auth_insert on public.ward_localities
for insert to authenticated
with check (true);

drop policy if exists ward_localities_auth_update on public.ward_localities;
create policy ward_localities_auth_update on public.ward_localities
for update to authenticated
using (true)
with check (true);

drop policy if exists ward_localities_auth_delete on public.ward_localities;
create policy ward_localities_auth_delete on public.ward_localities
for delete to authenticated
using (true);

-- ---------- Import helper table for localities_from_osm_deduped.csv ----------
create table if not exists public.ward_localities_import (
  city_id text,
  ward_id text,
  ward_number int,
  ward_name text,
  zone_name text,
  locality_name text,
  place_type text,
  osm_type text,
  osm_id text,
  lat double precision,
  lng double precision,
  source_name text,
  source_url text,
  is_verified boolean,
  notes text
);

-- Validate mismatches before upsert.
select i.*
from public.ward_localities_import i
left join public.wards w on w.id = i.ward_id
where w.id is null
   or w.ward_number <> i.ward_number
limit 100;

insert into public.ward_localities (
  city_id,
  ward_id,
  ward_number,
  ward_name,
  zone_name,
  locality_name,
  place_type,
  osm_type,
  osm_id,
  lat,
  lng,
  source_name,
  source_url,
  is_verified,
  notes
)
select
  i.city_id,
  i.ward_id,
  i.ward_number,
  i.ward_name,
  i.zone_name,
  i.locality_name,
  i.place_type,
  i.osm_type,
  i.osm_id,
  i.lat,
  i.lng,
  i.source_name,
  i.source_url,
  coalesce(i.is_verified, false),
  i.notes
from public.ward_localities_import i
join public.wards w
  on w.id = i.ward_id
 and w.ward_number = i.ward_number
where i.locality_name is not null
  and btrim(i.locality_name) <> ''
on conflict (city_id, ward_id, locality_name_norm)
do update set
  ward_number = excluded.ward_number,
  ward_name = excluded.ward_name,
  zone_name = excluded.zone_name,
  place_type = excluded.place_type,
  osm_type = excluded.osm_type,
  osm_id = excluded.osm_id,
  lat = excluded.lat,
  lng = excluded.lng,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  is_verified = excluded.is_verified,
  notes = excluded.notes;

-- ---------- Enforce authenticated upvotes ----------
create unique index if not exists report_supports_report_user_unique_idx
  on public.report_supports(report_id, supporter_user_id)
  where supporter_user_id is not null;

drop policy if exists supports_public_insert on public.report_supports;
drop policy if exists supports_auth_insert on public.report_supports;
create policy supports_auth_insert on public.report_supports
for insert to authenticated
with check (supporter_user_id = auth.uid());

-- ---------- Escalations ----------
create table if not exists public.report_escalations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  escalator_session_id text not null,
  escalator_user_id uuid references auth.users(id),
  reason text,
  escalation_level int not null default 1 check (escalation_level >= 1),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_escalations_report_idx
  on public.report_escalations(report_id);
create index if not exists report_escalations_status_idx
  on public.report_escalations(status);
create unique index if not exists report_escalations_one_open_per_report_idx
  on public.report_escalations(report_id)
  where status = 'open';

create or replace function public.set_report_escalation_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists report_escalations_set_updated_at on public.report_escalations;
create trigger report_escalations_set_updated_at
before update on public.report_escalations
for each row execute function public.set_report_escalation_updated_at();

alter table public.report_escalations enable row level security;

drop policy if exists report_escalations_public_read on public.report_escalations;
create policy report_escalations_public_read on public.report_escalations
for select using (true);

drop policy if exists report_escalations_public_insert on public.report_escalations;
create policy report_escalations_public_insert on public.report_escalations
for insert with check (true);

drop policy if exists report_escalations_auth_update on public.report_escalations;
create policy report_escalations_auth_update on public.report_escalations
for update to authenticated
using (true)
with check (true);

drop policy if exists report_escalations_auth_delete_own on public.report_escalations;
create policy report_escalations_auth_delete_own on public.report_escalations
for delete to authenticated
using (escalator_user_id = auth.uid());
