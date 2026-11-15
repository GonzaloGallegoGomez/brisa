import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import { createHandler } from './handler.mjs';
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(createHandler({
 origin:'https://brisa-plan-estudio.gleamingalbum4.chatgpt.site',
 async verifyUser(token:string){const {data,error}=await admin.auth.getUser(token);if(error)return null;return data.user;},
 async deleteUser(id:string){const {error}=await admin.auth.admin.deleteUser(id);if(error)throw error;}
}));
