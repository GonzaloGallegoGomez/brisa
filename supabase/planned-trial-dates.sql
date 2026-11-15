-- The fixed trial has been cancelled. No scheduled opening or deletion.
begin;
update public.brisa_registration_settings set trial_starts_at=null,trial_ends_at=null,trial_export_ends_at=null,terms_version='0.10.0-borrador',privacy_version='0.10.0-borrador' where singleton;
commit;
