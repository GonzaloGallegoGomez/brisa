export function createHandler({verifyUser,deleteUser,origin}) {
 return async request=>{
  const headers={'Content-Type':'application/json','Vary':'Origin','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
  const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers});
  if(request.headers.get('origin')&&request.headers.get('origin')!==origin)return reply(403,{error:'Origin not allowed'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'POST required'});
  const authorization=request.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return reply(401,{error:'Sign in required'});
  try {
   const user=await verifyUser(authorization.slice(7));
   if(!user?.id)return reply(401,{error:'Sign in required'});
   const body=await request.json();
   if(body.confirmation!=='ELIMINAR')return reply(400,{error:'Confirmation required'});
   // Never accept a target user ID from the request. Cascades delete only this user's data.
   await deleteUser(user.id);
   return reply(200,{deleted:true});
  } catch {return reply(400,{error:'Unable to delete account'});}
 };
}
