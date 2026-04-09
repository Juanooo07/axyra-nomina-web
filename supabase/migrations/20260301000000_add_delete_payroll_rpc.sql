-- Add a helper function to delete payroll_history rows using a secure definer

-- This function runs with the privileges of the schema owner, bypassing RLS
-- so that the frontend can call it even if RLS policies are misconfigured or
-- behaving unexpectedly. It simply performs a delete by id.

create or replace function public.delete_payroll_history_row(p_id uuid)
returns void language plpgsql security definer as $$
begin
  delete from public.payroll_history where id = p_id;
end;
$$;

-- Grant execute to authenticated users so clients can call it
grant execute on function public.delete_payroll_history_row(uuid) to authenticated;
