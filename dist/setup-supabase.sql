-- Brisa v0.7.0 — Ejecutar completo en Supabase > SQL Editor > New query.
-- No pide ni contiene contraseñas o claves secretas. No borra datos existentes.
begin;
create table if not exists public.brisa_calendars (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision bigint not null default 1 check (revision >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint brisa_payload_object check (jsonb_typeof(payload)='object'),
 constraint brisa_payload_size check (octet_length(payload::text)<=2097152)
);
alter table public.brisa_calendars enable row level security;
alter table public.brisa_calendars force row level security;
revoke all on table public.brisa_calendars from public,anon;
revoke all on table public.brisa_calendars from authenticated;
grant select,insert,update on table public.brisa_calendars to authenticated;
drop policy if exists brisa_read_own on public.brisa_calendars;
create policy brisa_read_own on public.brisa_calendars for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists brisa_insert_own on public.brisa_calendars;
create policy brisa_insert_own on public.brisa_calendars for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists brisa_update_own on public.brisa_calendars;
create policy brisa_update_own on public.brisa_calendars for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Compare-and-swap: una revisión antigua nunca sobrescribe una más nueva.
-- p_owner_id también protege frente a una petición pendiente al cambiar de cuenta.
create or replace function public.brisa_save_calendar(p_owner_id uuid,p_payload jsonb,p_expected_revision bigint)
returns table(revision bigint,updated_at timestamptz)
language plpgsql security invoker set search_path='' as $$
declare saved_revision bigint; saved_at timestamptz;
begin
 if auth.uid() is null or p_owner_id is distinct from auth.uid() then
  raise exception 'BRISA_UNAUTHORIZED' using errcode='42501';
 end if;
 if p_expected_revision is null or p_expected_revision<0 or jsonb_typeof(p_payload) is distinct from 'object'
  or octet_length(p_payload::text)>2097152 or p_payload->>'version' is distinct from '3'
  or jsonb_typeof(p_payload->'tasks') is distinct from 'array'
  or jsonb_typeof(p_payload->'fixed') is distinct from 'array'
  or jsonb_typeof(p_payload->'social') is distinct from 'array' then
  raise exception 'BRISA_INVALID_PAYLOAD' using errcode='22023';
 end if;
 if p_expected_revision=0 then
  insert into public.brisa_calendars as c(user_id,payload,revision,updated_at)
   values(p_owner_id,p_payload,1,clock_timestamp())
   on conflict(user_id) do nothing returning c.revision,c.updated_at into saved_revision,saved_at;
 else
  update public.brisa_calendars as c set payload=p_payload,revision=c.revision+1,updated_at=clock_timestamp()
   where c.user_id=p_owner_id and c.revision=p_expected_revision
   returning c.revision,c.updated_at into saved_revision,saved_at;
 end if;
 if saved_revision is null then raise exception 'BRISA_CONFLICT' using errcode='40001'; end if;
 return query select saved_revision,saved_at;
end;
$$;
revoke all on function public.brisa_save_calendar(uuid,jsonb,bigint) from public,anon;
grant execute on function public.brisa_save_calendar(uuid,jsonb,bigint) to authenticated;

-- Comprobación pública sin datos de usuarios ni permisos de escritura.
create or replace function public.brisa_schema_version() returns integer
language sql stable security invoker set search_path='' as $$ select 1; $$;
revoke all on function public.brisa_schema_version() from public;
grant execute on function public.brisa_schema_version() to anon,authenticated;
commit;
-- Debe devolver 1. Después crea TU usuario de prueba en Authentication > Users.
select public.brisa_schema_version();
