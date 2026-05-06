-- 012: Queue requests for official @nammaporuppu amplification (admin monitors + posts).
-- Run after 011. Service role bypasses RLS for server routes; no public read/write.

create table if not exists public.social_amplify_requests (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  requested_by uuid references auth.users (id) on delete set null,
  suggested_text text not null,
  status text not null default 'pending'
    check (status in ('pending', 'posted', 'rejected')),
  twitter_post_id text,
  twitter_url text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_amplify_requests_status_idx
  on public.social_amplify_requests (status, created_at desc);

create index if not exists social_amplify_requests_report_idx
  on public.social_amplify_requests (report_id);

-- At most one pending queue row per report (re-submit after posted/rejected).
create unique index if not exists social_amplify_one_pending_per_report
  on public.social_amplify_requests (report_id)
  where (status = 'pending');

drop trigger if exists social_amplify_requests_set_updated_at on public.social_amplify_requests;
create trigger social_amplify_requests_set_updated_at
before update on public.social_amplify_requests
for each row execute function public.set_updated_at();

alter table public.social_amplify_requests enable row level security;

-- No policies: only service role (server) can access. Authenticated clients use API routes.
