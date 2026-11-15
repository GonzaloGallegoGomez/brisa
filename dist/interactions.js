'use strict';
(function(){
 const reduced=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
 const active=new WeakMap();
 function noMotion(){return !!reduced?.matches||document.documentElement.getAttribute('data-motion')==='off'}
 document.addEventListener('click',event=>{
  if(noMotion())return;
  const control=event.target.closest?.('.themeChoice,.dayChoices label,.motionSetting')||event.target.closest?.('button,a,summary,input,select,textarea');
  if(!control||control.disabled||control.getAttribute('aria-disabled')==='true'||typeof control.animate!=='function')return;
  const previous=active.get(control);if(previous&&performance.now()-previous.time<90)return;
  previous?.animation.cancel();
  const press=['INPUT','SELECT','TEXTAREA'].includes(control.tagName)?'.995':'.98';
  const animation=control.animate([{scale:press},{scale:'1'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
  active.set(control,{animation,time:performance.now()});
 },true);
 // An invalid required field in a collapsed section must remain reachable.
 document.addEventListener('invalid',event=>{let section=event.target.closest?.('details');while(section){section.open=true;section=section.parentElement?.closest('details')}},true);
 if(reduced?.addEventListener)reduced.addEventListener('change',()=>{if(noMotion())document.getAnimations?.().forEach(a=>a.cancel())});
})();
