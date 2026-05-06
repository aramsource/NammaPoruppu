-- 011: Harden report status updates with server-side transition checks.
-- This complements UI checks so status changes cannot be bypassed via direct API calls.

create or replace function public.enforce_report_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only enforce when status is actually changing.
  if new.status is distinct from old.status then
    -- Require authenticated user for status transitions.
    if auth.uid() is null then
      raise exception 'Authentication required for status update';
    end if;

    -- Only the reporter can change status.
    if old.reporter_user_id is distinct from auth.uid() then
      raise exception 'Only the original reporter can change report status';
    end if;

    -- Allow only the transitions currently supported by product rules.
    if not (
      (old.status = 'open' and new.status = 'pending_verification')
      or
      (old.status = 'pending_verification' and new.status in ('resolved', 'open'))
      or (old.status = 'open' and new.status = 'withdrawn')
    ) then
      raise exception 'Invalid report status transition: % -> %', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists reports_enforce_status_transition on public.reports;
create trigger reports_enforce_status_transition
before update on public.reports
for each row execute function public.enforce_report_status_transition();
