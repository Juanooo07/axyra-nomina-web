-- Delete payrolls by contract type within a date range (security definer)

create or replace function public.delete_payrolls_by_contract(p_contract text, p_start date, p_end date)
returns integer language plpgsql security definer as $$
declare
  deleted_count integer := 0;
begin
  delete from public.payroll_history ph
  using public.employees e
  where ph.employee_id = e.id
    and e.contract_type = p_contract
    and ph.user_id = e.user_id
    and ph.created_at::date >= p_start
    and ph.created_at::date <= p_end;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  return deleted_count;
end;
$$;

grant execute on function public.delete_payrolls_by_contract(text, date, date) to authenticated;