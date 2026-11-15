-- Apply after setup, registration_gate and registration-hardening.
-- The trial stays closed. No start/end dates or mass deletion are activated here.
begin;
alter table public.brisa_terms_acceptances add column adult_declared boolean not null default false;
create or replace function brisa_private.brisa_guard_signup() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.brisa_registration_settings;
begin
 select * into strict s from public.brisa_registration_settings where singleton;
 if not(s.registration_open and s.smtp_ready and s.legal_ready) or s.terms_version like '%borrador%' or s.privacy_version like '%borrador%' then
  raise exception 'BRISA_REGISTRATION_CLOSED';
 end if;
 if new.raw_user_meta_data->'brisa_adult' is distinct from 'true'::jsonb then
  raise exception 'BRISA_ADULT_REQUIRED';
 end if;
 if new.raw_user_meta_data->'brisa_accept_terms' is distinct from 'true'::jsonb or new.raw_user_meta_data->>'brisa_terms_version' is distinct from s.terms_version or new.raw_user_meta_data->>'brisa_privacy_version' is distinct from s.privacy_version then
  raise exception 'BRISA_TERMS_REQUIRED';
 end if;
 return new;
end $$;
revoke all on function brisa_private.brisa_guard_signup() from public,anon,authenticated;
create or replace function brisa_private.brisa_record_acceptance() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.brisa_terms_acceptances(user_id,terms_version,privacy_version,adult_declared) select new.id,terms_version,privacy_version,true from public.brisa_registration_settings where singleton;
 return new;
end $$;
revoke all on function brisa_private.brisa_record_acceptance() from public,anon,authenticated;
create or replace function brisa_private.brisa_account_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.brisa_pilot_accounts where user_id=(select auth.uid())) or exists(select 1 from auth.users u join public.brisa_terms_acceptances a on a.user_id=u.id where u.id=(select auth.uid()) and u.email_confirmed_at is not null and a.adult_declared);
$$;
revoke all on function brisa_private.brisa_account_allowed() from public,anon,authenticated;
grant execute on function brisa_private.brisa_account_allowed() to authenticated;
update public.brisa_registration_settings set terms_version='0.9.0-borrador',privacy_version='0.9.0-borrador' where singleton;
commit;
