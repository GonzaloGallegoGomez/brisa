'use strict';
(async function(){
 const $=id=>document.getElementById(id),cfg=window.BRISA_SUPABASE;
 const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'brisa-supabase-session'}});
 let recovery=false;
 const url=new URL(window.location.href),code=url.searchParams.get('code');
 // Strip credentials/errors before any further navigation. No third-party resources on this page.
 window.history.replaceState(null,'',url.pathname);
 try{
  if(!code)throw Error('missing');
  const {data,error}=await client.auth.exchangeCodeForSession(code);
  if(error||!data?.session)throw error||Error('missing');
  // redirectType comes from the SDK's stored PKCE verifier, never a query flag.
  recovery=data.redirectType==='recovery';
  if(recovery){$('passwordForm').hidden=false;$('authMessage').textContent='Elige una contraseña de al menos 12 caracteres.';}
  else $('authMessage').textContent='Correo confirmado. Ya puedes volver a Brisa.';
 }catch{$('authMessage').textContent='Este enlace ha caducado o se abrió en otro navegador. Vuelve a Brisa y solicita otro.';}
 $('passwordForm').onsubmit=async event=>{
  event.preventDefault();if(!recovery)return;
  const password=$('newPassword').value;
  if(password.length<12||password!==$('repeatPassword').value){$('authMessage').textContent='Las contraseñas deben coincidir y tener al menos 12 caracteres.';return;}
  $('savePassword').disabled=true;
  try{const {error}=await client.auth.updateUser({password});if(error)throw error;
   recovery=false;$('passwordForm').hidden=true;$('newPassword').value='';$('repeatPassword').value='';
   const result=await client.auth.signOut({scope:'global'});
   $('authMessage').textContent=result.error?'Contraseña guardada. Vuelve a Brisa para gestionar tus sesiones.':'Contraseña guardada. Vuelve a Brisa e inicia sesión de nuevo.';
  }catch{$('authMessage').textContent='No se pudo cambiar la contraseña. Solicita otro enlace si ha caducado.';}
  finally{$('savePassword').disabled=false;}
 };
})();
