-- Planned dates only: this does not enable registration, send notices or schedule deletion.
-- Apply after adult-trial.sql. Existing installations already contain these columns.
begin;
alter table public.brisa_registration_settings
 add column if not exists trial_starts_at timestamptz,
 add column if not exists trial_ends_at timestamptz,
 add column if not exists trial_export_ends_at timestamptz,
 add column if not exists trial_timezone text not null default 'Europe/Madrid';
update public.brisa_registration_settings set
 trial_starts_at='2026-11-16T00:00:00+01:00',
 trial_ends_at='2027-01-15T00:00:00+01:00',
 trial_export_ends_at='2027-02-14T00:00:00+01:00',
 trial_timezone='Europe/Madrid',
 terms_version='0.9.1-borrador',privacy_version='0.9.1-borrador'
where singleton;
commit;
