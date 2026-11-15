-- Public registration is deliberately closed until SMTP and legal documents are ready.
begin;
create table public.brisa_registration_settings (
 singleton boolean primary key default true check(singleton),
 registration_open boolean not null default false,
 smtp_ready boolean not null default false,
 legal_ready boolean not null default false,
 terms_version text not null default '0.7.0-borrador',
 privacy_version text not null default '0.7.0-borrador'
);
insert into public.brisa_registration_settings(singleton) values(true);
alter table public.brisa_registration_settings enable row level security;
revoke all on public.brisa_registration_settings from public,anon,authenticated;
create table public.brisa_terms_acceptances (
 user_id uuid not null references auth.users(id) on delete cascade,
 terms_version text not null,
 privacy_version text not null,
 accepted_at timestamptz not null default now(),
 primary key(user_id,terms_version,privacy_version)
);
alter table public.brisa_terms_acceptances enable row level security;
revoke all on public.brisa_terms_acceptances from public,anon,authenticated;
create table public.brisa_pilot_accounts(user_id uuid primary key references auth.users(id) on delete cascade);
insert into public.brisa_pilot_accounts select id from auth.users where lower(email)='gallegogonzalo2@gmail.com' and email_confirmed_at is not null;
alter table public.brisa_pilot_accounts enable row level security;
revoke all on public.brisa_pilot_accounts from public,anon,authenticated;
create function public.brisa_registration_status() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('open',registration_open and smtp_ready and legal_ready and terms_version not like '%borrador%' and privacy_version not like '%borrador%', 'terms_version',terms_version,'privacy_version',privacy_version) from public.brisa_registration_settings where singleton;
$$;
revoke all on function public.brisa_registration_status() from public;
grant execute on function public.brisa_registration_status() to anon,authenticated;
create function public.brisa_guard_signup() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.brisa_registration_settings;
begin
 select * into strict s from public.brisa_registration_settings where singleton;
 if not(s.registration_open and s.smtp_ready and s.legal_ready) or s.terms_version like '%borrador%' or s.privacy_version like '%borrador%' then
  raise exception 'BRISA_REGISTRATION_CLOSED';
 end if;
 if new.raw_user_meta_data->'brisa_accept_terms' is distinct from 'true'::jsonb or new.raw_user_meta_data->>'brisa_terms_version' is distinct from s.terms_version or new.raw_user_meta_data->>'brisa_privacy_version' is distinct from s.privacy_version then
  raise exception 'BRISA_TERMS_REQUIRED';
 end if;
 return new;
end $$;
revoke all on function public.brisa_guard_signup() from public,anon,authenticated;
create trigger brisa_guard_signup before insert on auth.users for each row execute function public.brisa_guard_signup();
create function public.brisa_record_acceptance() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.brisa_terms_acceptances(user_id,terms_version,privacy_version) select new.id,terms_version,privacy_version from public.brisa_registration_settings where singleton;
 return new;
end $$;
revoke all on function public.brisa_record_acceptance() from public,anon,authenticated;
create trigger brisa_record_acceptance after insert on auth.users for each row execute function public.brisa_record_acceptance();
create function public.brisa_account_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.brisa_pilot_accounts where user_id=(select auth.uid())) or exists(select 1 from auth.users u join public.brisa_terms_acceptances a on a.user_id=u.id where u.id=(select auth.uid()) and u.email_confirmed_at is not null);
$$;
revoke all on function public.brisa_account_allowed() from public;
grant execute on function public.brisa_account_allowed() to authenticated;
drop policy brisa_read_own on public.brisa_calendars;
drop policy brisa_insert_own on public.brisa_calendars;
drop policy brisa_update_own on public.brisa_calendars;
create policy brisa_read_own on public.brisa_calendars for select to authenticated using ((select auth.uid())=user_id and (select public.brisa_account_allowed()));
create policy brisa_insert_own on public.brisa_calendars for insert to authenticated with check ((select auth.uid())=user_id and (select public.brisa_account_allowed()));
create policy brisa_update_own on public.brisa_calendars for update to authenticated using ((select auth.uid())=user_id and (select public.brisa_account_allowed())) with check ((select auth.uid())=user_id and (select public.brisa_account_allowed()));
commit;
