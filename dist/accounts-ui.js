'use strict';
(function(){
 const $=id=>document.getElementById(id),cfg=window.BRISA_SUPABASE,app=window.BrisaApp;
 const client=window.supabase?.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'brisa-supabase-session'}});
 let user=null,suppress=false,switchToken=0,serverPayload=null,connecting=false,recovery=null,usingCloud=false;
 const pendingKey=id=>'brisa-cloud-pending-'+id;
 const read=key=>{try{return JSON.parse(localStorage.getItem(key))}catch{return null}};
 function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{$('accountMessage').textContent='No se pudo guardar una copia local. Descarga una copia antes de salir.';return false}}
 function clearPending(){if(user){try{localStorage.removeItem(pendingKey(user.id))}catch{}}recovery=null;$('cloudRecovery').hidden=true;}
 function model(payload){if(!Planner.validState(payload))throw Error('BRISA_INVALID_CLOUD_DATA');return Planner.migrate(payload)}
 function errorMessage(error){const code=error?.code||'',message=String(error?.message||error||'');if(code==='PGRST202'||code==='42P01'||/schema cache|brisa_calendars|brisa_save_calendar/.test(message))return 'Falta ejecutar el SQL de Brisa en tu proyecto Supabase.';if(code==='40001'||message.includes('BRISA_CONFLICT'))return 'Hay cambios más recientes en otro dispositivo. Recarga la nube para revisarlos.';if(message.includes('BRISA_INVALID'))return 'Los datos recibidos no son compatibles. Conserva una copia y revisa la configuración.';if(code==='invalid_credentials')return 'El correo o la contraseña no son correctos.';if(code==='email_not_confirmed')return 'Confirma tu correo antes de entrar.';if(code==='22023')return 'El horario no se pudo guardar: revisa su formato o tamaño. Descarga una copia.';return 'No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.';}
 const backend={
  async load(owner){const {data,error}=await client.from('brisa_calendars').select('payload,revision,updated_at').eq('user_id',owner).maybeSingle();if(error)throw error;return data;},
  async save(owner,payload,revision){const {data,error}=await client.rpc('brisa_save_calendar',{p_owner_id:owner,p_payload:payload,p_expected_revision:revision});if(error)throw error;if(!Array.isArray(data)||data.length!==1)throw Error('BRISA_INVALID_REVISION');return data[0];}
 };
 const sync=new BrisaCloud.CloudSync({backend,validate:Planner.validState,delay:cfg.syncDelay,
  onLoad(payload){
   const saved=read(pendingKey(user.id));recovery=saved&&Planner.validState(saved)?model(saved):null;serverPayload=payload?model(payload):null;
   suppress=true;try{app.replaceScope(user.id,serverPayload)}finally{suppress=false}
   if(recovery&&JSON.stringify(recovery)!==JSON.stringify(serverPayload))$('cloudRecovery').hidden=false;else clearPending();
  },
  onStatus(status){
   const labels={loading:'Cargando tu cuenta…',pending:'Cambios pendientes',saving:'Guardando…',saved:'Guardado en tu cuenta',conflict:'Cambios en otro dispositivo', 'load-error':'Nube sin configurar o sin conexión','save-error':'Guardado pendiente en este dispositivo'};
   $('cloudStatus').textContent=status.name==='saved'&&status.revision===0?'Cuenta lista · sin horario en nube':labels[status.name]||'Modo local';
   $('cloudRetry').hidden=!['load-error','save-error','conflict'].includes(status.name);$('cloudSetupLink').hidden=status.name!=='load-error';
   if(status.error)$('accountMessage').textContent=errorMessage(status.error);
   if(status.name==='saved'&&!status.dirty){serverPayload=app.getState();if(!recovery)clearPending();}
   if(status.name==='conflict'){$('accountMessage').textContent=errorMessage(status.error);}
  }
 });
 function setIdentity(){const signed=!!user;$('signedOutPanel').hidden=signed;$('signedInPanel').hidden=!signed;$('accountIdentity').textContent=user?.email||'';$('accountButton').textContent=signed?'☁ Mi cuenta':'☁ Conectar cuenta';$('storageMode').textContent=signed?'Horario de tu cuenta · Supabase':'Guardado en este navegador';}
 async function switchSession(session){
  if(session&&user?.id===session.user?.id&&(sync.ready||connecting))return;
  const token=++switchToken;
  if(!session&&!usingCloud){setIdentity();app.setBusy(false);return;}
  if(!session){sync.disconnect();usingCloud=false;user=null;recovery=null;serverPayload=null;$('cloudRecovery').hidden=true;connecting=false;suppress=true;try{const local=read('brisa-v2')||read('brisa-v1');app.replaceScope(null,local&&Planner.validState(local)?model(local):null)}finally{suppress=false}setIdentity();$('cloudStatus').textContent='Modo local';$('cloudRetry').hidden=true;$('cloudSetupLink').hidden=true;app.setBusy(false);return;}
  connecting=true;app.setBusy(true);sync.disconnect();
  try{
   const {data,error}=await client.auth.getUser();if(token!==switchToken)return;if(error||!data.user)throw error||Error('No user');
   user=data.user;usingCloud=true;setIdentity();suppress=true;try{app.replaceScope(user.id,null)}finally{suppress=false}
   await sync.connect(user.id);if(token!==switchToken)return;
   if(sync.ready){$('accountModal').close();if(!recovery)app.startAccountTour();}
  }catch(error){if(token===switchToken){$('accountMessage').textContent=errorMessage(error);$('cloudStatus').textContent='No se pudo verificar la sesión';}}
  finally{if(token===switchToken){connecting=false;app.setBusy(false);}}
 }
 async function reload(){if(!user||connecting)return;connecting=true;app.setBusy(true);try{await sync.connect(user.id)}finally{connecting=false;app.setBusy(false)}}
 window.BrisaAccounts={localChanged(payload){if(suppress||!user)return;const copy=model(payload);persist(pendingKey(user.id),copy);recovery=null;$('cloudRecovery').hidden=true;sync.queue(copy);}};
 $('accountButton').onclick=()=>{if($('tour').open)return;$('accountMessage').textContent='';setIdentity();$('accountModal').showModal()};$('closeAccount').onclick=()=>$('accountModal').close();
 $('accountLoginForm').onsubmit=async event=>{event.preventDefault();if(!client)return;const email=$('accountEmail').value.trim(),password=$('accountPassword').value;$('accountLogin').disabled=true;$('accountMessage').textContent='Entrando…';try{const {data,error}=await client.auth.signInWithPassword({email,password});$('accountPassword').value='';if(error)throw error;await switchSession(data.session);}catch(error){$('accountMessage').textContent=errorMessage(error);}finally{$('accountLogin').disabled=false;}};
 async function signOut(keepPending=false){if(!client)return;$('accountLogout').disabled=true;try{
  if(!keepPending&&sync.ready&&!sync.conflict){await sync.flush();if(sync.dirty&&!sync.conflict)await sync.flush();}
  const pending=user?read(pendingKey(user.id)):null;
  if(pending&&!keepPending){$('logoutWarning').hidden=false;$('accountMessage').textContent='Quedan cambios sin sincronizar. Descarga una copia o confirma que quieres conservarlos aquí antes de salir.';return;}
  const previous=user?.id;const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;
  if(previous){try{localStorage.removeItem('brisa-account-'+previous);localStorage.removeItem('brisa-tutorial-'+previous)}catch{}}
  await switchSession(null);$('accountPassword').value='';$('accountModal').close();$('logoutWarning').hidden=true;
 }catch(error){$('accountMessage').textContent=errorMessage(error);}finally{$('accountLogout').disabled=false;}}
 $('accountLogout').onclick=()=>signOut();$('logoutKeepPending').onclick=()=>signOut(true);$('logoutDownload').onclick=()=>{const p=user?read(pendingKey(user.id)):null;if(p)app.downloadPending(p)};
 $('reloadCloudPlan').onclick=reload;$('cloudRetry').onclick=reload;
 $('importBrowserPlan').onclick=()=>{const data=read('brisa-v2')||read('brisa-v1');if(!data||!Planner.validState(data)){$('accountMessage').textContent='No hay un horario local válido para importar.';return}$('accountModal').close();app.proposeImport(data)};
 $('recoverLocalChanges').onclick=()=>{if(recovery)app.proposeImport(recovery)};
 $('downloadPendingChanges').onclick=()=>{if(recovery)app.downloadPending(recovery)};
 $('keepCloudVersion').onclick=()=>{clearPending();suppress=true;try{app.replaceScope(user.id,serverPayload)}finally{suppress=false}app.startAccountTour()};
 if(!client){$('accountButton').disabled=true;$('cloudStatus').textContent='Modo local · conexión no disponible';return;}
 // No Supabase calls are awaited inside the auth callback (avoids auth-lock deadlocks).
 client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>switchSession(session),0)});
})();
