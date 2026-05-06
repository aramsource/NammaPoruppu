-- 010: Allow reporters to soft-delete (withdraw) their own reports.
-- Run this in Supabase SQL editor after 004_seed_all_chennai_wards.sql.

-- 1. Expand the status check constraint to include 'withdrawn'.
alter table public.reports
  drop constraint if exists reports_status_check;

alter table public.reports
  add constraint reports_status_check
  check (status in ('open', 'pending_verification', 'resolved', 'withdrawn'));

-- 2. Update the public read policy so withdrawn reports are hidden from
--    everyone EXCEPT the reporter who submitted them.
drop policy if exists reports_public_read on public.reports;
create policy reports_public_read on public.reports
  for select using (
    status <> 'withdrawn'
    or reporter_user_id = auth.uid()
  );

-- 3. Add an update policy so an authenticated reporter can only set
--    status = 'withdrawn' on their own reports.
drop policy if exists reports_reporter_withdraw on public.reports;
create policy reports_reporter_withdraw on public.reports
  for update to authenticated
  using  (reporter_user_id = auth.uid())
  with check (
    reporter_user_id = auth.uid()
    and status = 'withdrawn'
  );
