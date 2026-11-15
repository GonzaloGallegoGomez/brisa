const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
function boot({reduced=false,motion='on'}={}) {
 const events={},calls=[];
 const control={
  tagName:'BUTTON',disabled:false,getAttribute:()=>null,
  animate(frames,options){calls.push({frames,options});return {cancel(){calls.push({cancelled:true})}}}
 };
 const node={closest:selector=>selector.startsWith('.themeChoice')?null:control};
 let clock=0;
 const context=vm.createContext({
  WeakMap,performance:{now:()=>clock},
  window:{matchMedia:()=>({matches:reduced,addEventListener(){}})},
  document:{documentElement:{getAttribute:()=>motion},addEventListener(name,handler,capture){events[name]={handler,capture}}}
 });
 vm.runInContext(fs.readFileSync(require.resolve('../dist/interactions.js'),'utf8'),context);
 return {events,calls,control,node,tick:()=>clock+=200};
}
test('un clic de control recibe una única respuesta breve, sin recrear el contenido',()=>{const a=boot();assert.equal(a.events.click.capture,true);a.events.click.handler({target:a.node});assert.equal(a.calls.length,1);assert.equal(a.calls[0].options.duration,180);a.events.click.handler({target:a.node});assert.equal(a.calls.length,1);a.tick();a.events.click.handler({target:a.node});assert.equal(a.calls.filter(x=>x.frames).length,2)});
test('preferencia del sistema o interruptor desactivado impiden animaciones',()=>{for(const options of [{reduced:true},{motion:'off'}]){const a=boot(options);a.events.click.handler({target:a.node});assert.equal(a.calls.length,0)}});
test('controles deshabilitados no animan y los campos inválidos quedan accesibles',()=>{const a=boot();a.control.disabled=true;a.events.click.handler({target:a.node});assert.equal(a.calls.length,0);const parent={open:false,parentElement:null},child={open:false,parentElement:{closest:()=>parent}};a.events.invalid.handler({target:{closest:()=>child}});assert.equal(child.open,true);assert.equal(parent.open,true)});
