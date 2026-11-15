begin;
create schema if not exists brisa_private;
revoke all on schema brisa_private from public,anon,authenticated;
grant usage on schema brisa_private to authenticated;
alter function public.brisa_guard_signup() set schema brisa_private;
alter function public.brisa_record_acceptance() set schema brisa_private;
alter function public.brisa_account_allowed() set schema brisa_private;
revoke all on function brisa_private.brisa_account_allowed() from public,anon,authenticated;
grant execute on function brisa_private.brisa_account_allowed() to authenticated;
-- These settings contain only public readiness flags and document versions, never secrets.
grant select on public.brisa_registration_settings to anon,authenticated;
create policy brisa_public_readiness on public.brisa_registration_settings for select to anon,authenticated using(true);
alter function public.brisa_registration_status() security invoker;
create policy brisa_no_client_acceptance_access on public.brisa_terms_acceptances for all to anon,authenticated using(false) with check(false);
create policy brisa_no_client_pilot_access on public.brisa_pilot_accounts for all to anon,authenticated using(false) with check(false);
commit;
