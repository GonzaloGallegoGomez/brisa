'use strict';
document.getElementById('checkSupabase').onclick=async()=>{
 const button=document.getElementById('checkSupabase'),status=document.getElementById('supabaseCheckStatus');button.disabled=true;status.textContent='Comprobando…';
 try{const response=await fetch(window.BRISA_SUPABASE.url+'/rest/v1/rpc/brisa_schema_version',{headers:{apikey:window.BRISA_SUPABASE.publishableKey}});if(!response.ok)throw Error();const version=await response.json();status.textContent=version===1?'SQL instalado. Ya puedes crear tu usuario de prueba y entrar.':'La versión instalada no es compatible. Revisa el script.';}catch{status.textContent='No se ha podido verificar. Ejecuta el script completo en SQL Editor y comprueba la conexión.';}finally{button.disabled=false;}
};
