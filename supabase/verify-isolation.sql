-- Synthetic identities only, no emails sent, all fixture changes rolled back.
begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); p jsonb:='{"version":3,"tasks":[],"fixed":[],"social":[]}'; n integer;
begin
 begin
  insert into auth.users(id,email) values(a,'closed-'||a||'@example.invalid');
  raise exception 'FAIL: closed signup accepted';
 exception when others then if sqlerrm not like '%BRISA_REGISTRATION_CLOSED%' then raise; end if; end;
 update public.brisa_registration_settings set registration_open=true,smtp_ready=true,legal_ready=true,terms_version='test-v1',privacy_version='test-v1';
 begin
  insert into auth.users(id,email) values(a,'missing-'||a||'@example.invalid');
  raise exception 'FAIL: missing terms accepted';
 exception when others then if sqlerrm not like '%BRISA_TERMS_REQUIRED%' then raise; end if; end;
 insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 (a,'test-'||a||'@example.invalid',now(),'{"brisa_accept_terms":true,"brisa_terms_version":"test-v1","brisa_privacy_version":"test-v1"}'),
 (b,'test-'||b||'@example.invalid',now(),'{"brisa_accept_terms":true,"brisa_terms_version":"test-v1","brisa_privacy_version":"test-v1"}');
 select count(*) into n from public.brisa_terms_acceptances where user_id in(a,b);if n<>2 then raise exception 'FAIL: acceptance not logged';end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 set local role authenticated;
 perform public.brisa_save_calendar(a,p,0);
 begin
  perform public.brisa_save_calendar(b,p,0);
  raise exception 'FAIL: cross-user write';
 exception when insufficient_privilege then null;end;
 begin
  perform public.brisa_save_calendar(a,p,0);
  raise exception 'FAIL: stale write';
 exception when serialization_failure then null;end;
 reset role;
 perform set_config('request.jwt.claim.sub',b::text,true);
 set local role authenticated;
 select count(*) into n from public.brisa_calendars where user_id=a;if n<>0 then raise exception 'FAIL: cross-user read';end if;
 perform public.brisa_save_calendar(b,p,0);
 reset role;
 delete from auth.users where id=a;
 select count(*) into n from public.brisa_calendars where user_id=a;if n<>0 then raise exception 'FAIL: delete cascade';end if;
end $$;
rollback;
select 'PASS: signup gate, acceptance, own saves, cross-user denial, revision conflict, deletion cascade; fixtures rolled back' as result;
