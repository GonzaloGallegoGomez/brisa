'use strict';
const $=id=>document.getElementById(id);
const {iso,addDays,num,validDate,validTime}=Planner;
const monday=s=>addDays(s,-((new Date(s+'T12:00:00').getDay()+6)%7));
const fmt=h=>`${String(Math.floor(h)).padStart(2,'0')}:${String(Math.round(h%1*60)).padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='brisa-v2',TOUR_KEY='brisa-tutorial-v1';
let today=iso(new Date()),week=monday(today),undo=null,result,mode='fixed',tourStep=0,storageAvailable=true;
let agendaFilter='all',dailyItems=[],currentNext=null;
let currentView='today',editing=null,pendingProposal=null,currentSession=null,revision=0;
const initial={version:3,history:[],progress:[],pins:[],skips:[],studyPrefs:Planner.defaults(),sleep:{bed:'23:00',hours:8},tasks:[],fixed:[],social:[],study:[],tutorialDone:false,preferences:{name:'',theme:'green'}};
function readStorage(key){try{return localStorage.getItem(key)}catch{storageAvailable=false;return null}}
function writeStorage(key,value){try{localStorage.setItem(key,value);return true}catch{storageAvailable=false;return false}}
function migrate(s){return Planner.migrate(s)}
let state;
try{const saved=readStorage(STORAGE)||readStorage('brisa-v1');state=saved?migrate(JSON.parse(saved)):structuredClone(initial)}catch{state=structuredClone(initial)}
function calculate(s=state){return Planner.plan(s,week)}
function checkpoint(){undo=structuredClone(state)}
function toast(message){$('toast').textContent=message;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',6500)}
function protectionError(next){const before=calculate(),after=calculate(next);if(after.pending.some(p=>p.hours>(before.pending.find(b=>b.id===p.id)?.hours||0)))return 'Ese cambio deja horas de estudio sin hueco antes del examen. Prueba otra hora; tu calendario no ha cambiado.';return ''}
function updateFields(){
 const kind=$('kind').value,isTask=kind==='task',isSleep=kind==='sleep',isEvent=kind==='fixed'||kind==='social';
 $('taskFields').hidden=!isTask;$('eventFields').hidden=!isEvent;$('entrySleepFields').hidden=!isSleep;$('titleLabel').hidden=isSleep;$('daysLabel').hidden=kind!=='fixed';$('dateLabel').hidden=kind!=='social';$('recurrenceFields').hidden=kind!=='fixed';$('routineExamples').hidden=kind!=='fixed';
 // Disable inactive inputs as well as hiding them, so native validation never blocks another mode.
 for(const [id,active] of [['title',!isSleep],['due',isTask],['dueTime',isTask],['hours',isTask],['examDuration',isTask],['eventDate',kind==='social'],['from',isEvent],['to',isEvent],['entryBed',isSleep],['entrySleepHours',isSleep],['repeatWeeks',kind==='fixed'],['repeatStart',kind==='fixed'],['customRepeatWeeks',kind==='fixed'&&$('repeatWeeks').value==='custom']]){$(id).disabled=!active;$(id).required=active;}
 $('title').placeholder=isTask?'Ej.: Examen de matemáticas':kind==='social'?'Ej.: Gimnasio o cena con amigos':'Ej.: Clases, trabajo o transporte';
 $('formError').textContent='';updateRepeatPreview();
}
function setMode(next){mode=next;$('tabFixed').setAttribute('aria-pressed',String(mode==='fixed'));$('tabNew').setAttribute('aria-pressed',String(mode==='new'));$('kind').innerHTML=mode==='fixed'?'<option value="fixed">Clases, trabajo, transporte o rutina semanal</option><option value="task">Examen y horas de estudio</option><option value="sleep">Horas de sueño</option>':'<option value="social">Evento social, gimnasio o plan puntual</option>';$('kind').value=mode==='fixed'?'fixed':'social';$('modeHint').textContent=mode==='fixed'?'Tu base semanal.':'Un hueco para tus planes.';updateFields()}
function openEntry(next='fixed'){
 if($('tour').open)return;
 $('title').value='';$('due').value=addDays(today,20);$('due').min=today;$('due').max=addDays(today,365);$('eventDate').value=week>today?week:today;$('eventDate').min=today;
 $('repeatWeeks').value='1';$('repeatStart').value=week;
 $('entryBed').value=state.sleep.bed;$('entrySleepHours').value=state.sleep.hours;setMode(next);$('modal').showModal();
}
$('add').onclick=()=>openEntry('fixed');$('addNew').onclick=()=>openEntry('new');$('firstEntry').onclick=()=>openEntry('fixed');$('close').onclick=()=>$('modal').close();$('kind').onchange=updateFields;$('tabFixed').onclick=()=>setMode('fixed');$('tabNew').onclick=()=>setMode('new');
$('entry').onsubmit=submitEntry;
$('prev').onclick=()=>{week=addDays(week,-7);render()};$('next').onclick=()=>{week=addDays(week,7);render()};$('now').onclick=()=>{week=monday(today);render()};
$('weekNav').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});$('goalsNav').onclick=()=>$('details').scrollIntoView({behavior:'smooth'});
$('rhythmNav').onclick=()=>{if($('tour').open)return;$('bed').value=state.sleep.bed;$('sleepHours').value=state.sleep.hours;$('sleepModal').showModal()};$('closeSleep').onclick=()=>$('sleepModal').close();
$('sleepForm').onsubmit=e=>{e.preventDefault();const error=changeSleep($('bed').value,Number($('sleepHours').value));if(error){$('sleepError').textContent=error;return}$('sleepError').textContent='';$('sleepModal').close();toast('Descanso actualizado')};
$('items').onclick=e=>{const jump=e.target.closest('[data-jump]');if(jump){week=monday(jump.dataset.jump);render();$('calendar').scrollIntoView({behavior:'smooth'});return}const b=e.target.closest('button[data-id]');if(!b)return;checkpoint();state[b.dataset.kind]=state[b.dataset.kind].filter(x=>x.id!==b.dataset.id);save();toast('Eliminado. Escribe «deshacer» para recuperarlo.')};
$('example').onclick=()=>{$('prompt').value='Cena con amigos el viernes de 20:00 a 22:00';$('prompt').focus()};$('sleepExample').onclick=()=>{$('prompt').value='Quiero dormir 8 horas';$('prompt').focus()};
$('chat').onsubmit=e=>{
 e.preventDefault();const raw=$('prompt').value,text=raw.toLowerCase();let reply;
 if(text.includes('deshacer')){if(undo){const previous=undo;undo=structuredClone(state);state=previous;save();reply='Cambio deshecho. Tu plan anterior está recuperado.'}else reply='Todavía no hay cambios que deshacer en esta sesión.'}
 else if(text.includes('dormir')){const hours=text.match(/(\d+(?:[.,]\d+)?)\s*horas/),bed=text.match(/a las\s*(\d{1,2}:\d{2})/);if(hours){reply=changeSleep(bed?bed[1].padStart(5,'0'):state.sleep.bed,Number(hours[1].replace(',','.')))||'Descanso actualizado. El estudio mantiene sus horas hasta cada examen. Puedes escribir «deshacer».'}else reply='Prueba «Quiero dormir 8 horas» o ajusta la hora en Mi ritmo.';}
 else {
  const times=[...text.matchAll(/\b(\d{1,2}):([0-5]\d)\b/g)].map(m=>+m[1]+ +m[2]/60),date=text.match(/\b\d{4}-\d{2}-\d{2}\b/),normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,''),di=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].findIndex(n=>normalized.includes(n));
  if(times.length===2&&times.every(h=>h<24)&&(date||di>=0)){const day=date?date[0]:addDays(week,di),title=(raw.split(/\s+(?:el|de|desde)\s/i)[0].trim()||'Plan personal').slice(0,100);reply=addEvent({id:crypto.randomUUID(),title,date:day,start:times[0],end:times[1]},'social')||`He añadido «${title}» el ${day}. Se mantienen las horas de estudio hasta cada examen y tu descanso. Escribe «deshacer» para volver atrás.`;}
  else reply='Prueba «Cena el viernes de 20:00 a 22:00» (semana visible) o una fecha YYYY-MM-DD. Para un examen: Horario fijo → Examen y horas de estudio.';
 }
 $('reply').textContent=reply;$('prompt').value='';
};
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('backup').onclick=()=>download(JSON.stringify(state,null,2),'application/json','brisa-datos.json');
$('restore').onchange=async e=>{try{const restored=migrate(JSON.parse(await e.target.files[0].text()));checkpoint();state=restored;save();toast('Copia restaurada')}catch{toast('No se pudo leer esa copia de Brisa')}e.target.value=''};
$('export').onclick=()=>{
 const stamp=(date,h)=>h===24?addDays(date,1).replaceAll('-','')+'T000000':date.replaceAll('-','')+'T'+fmt(h).replace(':','')+'00';
 const escapeICS=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Brisa//Plan//ES'];result.events.forEach((e,i)=>lines.push('BEGIN:VEVENT','UID:'+e.id+'-'+e.date+'-'+i+'@brisa','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z'),'DTSTART:'+stamp(e.date,e.start),'DTEND:'+stamp(e.date,e.end),'SUMMARY:'+escapeICS(e.title),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Tu siguiente paso está cerca. Tómate un momento para prepararte.','END:VALARM','END:VEVENT'));lines.push('END:VCALENDAR');download(lines.join('\r\n'),'text/calendar','brisa-semana.ics');
};
const tourSteps=[
 ['✳','Tu día, a tu ritmo','En Hoy tienes tu siguiente bloque. Pulsa para abrirlo.','Cambia a Semana cuando quieras.'],
 ['▦','Tu base semanal','Añade clases, trabajo, transporte o sueño en Horario fijo.','Elige qué semanas se repite.'],
 ['◷','Un examen, un plan','Indica la fecha y las horas totales. Brisa las reparte.','Tú marcas lo que has estudiado.'],
 ['❋','Espacio para tus planes','Añade una cena o una sesión de gimnasio.','Revisa los cambios antes de aplicar.'],
 ['☾','Hazlo tuyo','Elige colores, pausas y días libres en Ajustes.','Tu horario se guarda en este navegador.']
];
function showTourStep(){const [symbol,title,text,example]=tourSteps[tourStep];$('tourCount').textContent=`${tourStep+1} DE ${tourSteps.length}`;$('tourSymbol').textContent=symbol;$('tourTitle').textContent=title;$('tourText').textContent=text;$('tourExample').textContent=example;$('tourDots').innerHTML=tourSteps.map((_,i)=>`<i class="${i===tourStep?'active':''}"></i>`).join('');$('tourNext').textContent=tourStep===tourSteps.length-1?'Empezar mi calendario':'Entendido, siguiente';$('tourNextClose').setAttribute('aria-label',tourStep===tourSteps.length-1?'Terminar tutorial':'Cerrar esta explicación y ver la siguiente');}
function startTour(){if($('modal').open||$('sleepModal').open||$('settingsModal').open)return;tourStep=0;showTourStep();$('tour').showModal()}
function nextTour(){if(tourStep<tourSteps.length-1){tourStep++;showTourStep();$('tourNext').focus()}else{state.tutorialDone=true;writeStorage(TOUR_KEY,'done');storePlan();$('tour').close();$('add').focus()}}
$('tourNext').onclick=nextTour;$('tourNextClose').onclick=nextTour;$('tour').oncancel=e=>{e.preventDefault();nextTour()};$('replayTour').onclick=startTour;
setupPreferences();
storePlan();render();if(!state.tutorialDone&&readStorage(TOUR_KEY)!=='done')startTour();
window.addEventListener('focus',()=>{const current=iso(new Date());if(current!==today){today=current;save()}else applyPreferences()});

function greeting(date,name){const h=date.getHours(),salute=h>=6&&h<12?'Buenos días':h>=12&&h<20?'Buenas tardes':'Buenas noches';return salute+(name?', '+name:'')+'.'}
function applyPreferences(){
 const preferences=state.preferences||{name:'',theme:'green'};
 document.documentElement.setAttribute('data-theme',preferences.theme);document.documentElement.setAttribute('data-motion',preferences.motion===false?'off':'on');
 $('greeting').textContent=greeting(new Date(),preferences.name);
 $('userName').textContent=preferences.name||'Tu espacio';$('userAvatar').textContent=preferences.name?Array.from(preferences.name)[0].toUpperCase():'T';
}
function setupPreferences(){
 $('settingsNav').onclick=()=>{if($('tour').open)return;$('preferredName').value=state.preferences.name;$('softMotion').checked=state.preferences.motion!==false;document.querySelectorAll('input[name="theme"]').forEach(r=>{r.checked=r.value===state.preferences.theme});$('settingsError').textContent='';$('settingsModal').showModal()};
 $('closeSettings').onclick=()=>$('settingsModal').close();
 $('settingsForm').onsubmit=e=>{e.preventDefault();const name=$('preferredName').value.trim(),theme=document.querySelector('input[name="theme"]:checked')?.value;if(name.length>40||!['green','blue','orange','violet','rose'].includes(theme)){$('settingsError').textContent='Elige una paleta y un nombre de hasta 40 caracteres.';return}state.preferences={name,theme,motion:$('softMotion').checked};writeStorage(STORAGE,JSON.stringify(state));applyPreferences();$('settingsModal').close();toast('Estilo guardado.');};
}
function updateRepeatPreview(){
 const custom=$('repeatWeeks').value==='custom';$('customRepeatLabel').hidden=!custom;$('customRepeatWeeks').disabled=!custom||$('kind').value!=='fixed';$('customRepeatWeeks').required=custom&&$('kind').value==='fixed';
 const interval=custom?Number($('customRepeatWeeks').value):Number($('repeatWeeks').value),ref=$('repeatStart').value;
 if(!validDate(ref)||!Number.isInteger(interval)||interval<1||interval>52){$('repeatPreview').textContent='Elige una semana y un intervalo de 1 a 52 semanas.';return}
 const anchor=monday(ref);$('repeatPreview').textContent='Semanas activas desde el lunes: '+[0,1,2].map(i=>new Date(addDays(anchor,i*interval*7)+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})).join(' · ')+'.';
}
$('repeatWeeks').onchange=updateRepeatPreview;$('repeatStart').onchange=updateRepeatPreview;$('customRepeatWeeks').oninput=updateRepeatPreview;
$('transportExample').onclick=()=>{$('title').value='Transporte a la universidad';$('from').value='08:00';$('to').value='08:30'};
$('classesExample').onclick=()=>{$('title').value='Clases de universidad';$('from').value='09:00';$('to').value='14:00'};

// v0.5: one mutation path, review before commit, actual progress separate from planning.
function storePlan(){
 const now=new Date(),day=iso(now),hour=now.getHours()+now.getMinutes()/60;
 state.history=[...new Map([...(state.history||[]),...(state.study||[]).filter(e=>e.date<day||e.date===day&&e.start<hour)].map(e=>[Planner.sessionKey(e),e])).values()].slice(-40000);
 result=calculate();state.study=result.allStudy;writeStorage(STORAGE,JSON.stringify(state));
}
function save(){revision++;storePlan();render()}
function clockLabel(e){return new Date(e.date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' · '+fmt(e.start)+'–'+fmt(e.end)}
function hours(n){return Math.round(n*100)/100+' h'}
function eventButton(e,compact=false){
 const label=e.type==='done'?'Hecho':e.type==='rest'||e.type==='break'?'Descanso':e.type==='exam'?'Examen':e.type==='study'?'Estudio':e.type==='fixed'?'Rutina':'Plan personal';
 return `<button type="button" class="agendaItem ${esc(e.type)}" data-event-key="${esc(e.key)}" aria-label="${esc(label+': '+e.title+', '+clockLabel(e))}"><span class="agendaTime">${fmt(e.start)}<small>${fmt(e.end)}</small></span><span><strong>${esc(e.title)}</strong><small>${label}${e.type==='done'?' · '+e.actualMinutes+' min':''}${e.pinned?' · fijado':''}</small></span><span aria-hidden="true">›</span></button>`;
}
function render(){
 applyPreferences();result=calculate();
 $('todayLabel').textContent=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
 $('focus').textContent=hours(result.studyHours);$('sleepStat').textContent=state.sleep.hours+' h';$('bedStat').textContent='Desde las '+state.sleep.bed;
 $('socialStat').textContent=state.social.filter(e=>e.date>=week&&e.date<addDays(week,7)).length+' planes';
 $('range').textContent=new Date(week+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})+' — '+new Date(addDays(week,6)+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
 $('sleepFooter').textContent=state.sleep.bed+' — '+fmt((num(state.sleep.bed)+state.sleep.hours)%24);
 const visible=result.events.filter(e=>e.type!=='break'&&e.type!=='rest');
 const axisStart=Math.min(8,...visible.map(e=>Math.floor(e.start))),axisEnd=Math.max(22,...visible.map(e=>Math.ceil(e.end))),span=axisEnd-axisStart;
 let html='<div></div>';for(let i=0;i<7;i++){const d=addDays(week,i);html+=`<div class="dayhead ${d===today?'today':''}">${['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'][i]}<strong>${Number(d.slice(-2))}</strong></div>`}
 html+='<div class="timecol">';for(let h=axisStart;h<=axisEnd;h+=2)html+=`<span class="time" style="top:${(h-axisStart)/span*100}%">${fmt(h)}</span>`;html+='</div>';
 for(let i=0;i<7;i++){const d=addDays(week,i);html+='<div class="daycol">';for(const e of result.events.filter(e=>e.date===d&&e.end>axisStart&&e.start<axisEnd)){
  const start=Math.max(axisStart,e.start),end=Math.min(axisEnd,e.end),rest=e.type==='rest'||e.type==='break';
  html+=`<button type="button" class="event ${esc(e.type)}" data-event-key="${esc(e.key)}" style="top:${(start-axisStart)/span*100}%;height:${Math.max(.6,(end-start)/span*100)}%" aria-label="${esc(e.title+', '+clockLabel(e))}" title="${esc(e.title)} · ${fmt(e.start)}–${fmt(e.end)}"><b>${rest?'':esc(e.title)}</b><small>${rest?'':fmt(e.start)+'–'+fmt(e.end)}</small></button>`;
 }html+='</div>'}$('calendar').innerHTML=html;
 $('weekAgenda').innerHTML=Array.from({length:7},(_,i)=>{const date=addDays(week,i);return '<details><summary>'+new Date(date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})+'</summary>'+result.events.filter(e=>e.date===date&&e.type!=='break').map(e=>eventButton(e)).join('')+'</details>'}).join('');
 $('upcoming').innerHTML=[...state.tasks].sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3).map(t=>{const allocated=result.allStudy.filter(e=>e.id===t.id).reduce((n,e)=>n+e.end-e.start,0),done=Planner.completedMinutes(state,t.id)/60;return `<div class="deadline"><div class="datebox">${new Date(t.due+'T12:00:00').toLocaleDateString('es',{month:'short'})}<strong>${Number(t.due.slice(-2))}</strong></div><div><p>${esc(t.title)}</p><small>${esc(t.dueTime)} · ${t.due<today?'Revisa esta fecha':'Un paso a la vez'}</small><small class="taskPlan">${hours(done)} / ${hours(t.hours)}</small></div></div>`}).join('')||'<p class="formHint">Tu próximo objetivo, aquí.</p>';
 const warnings=[];if(result.pending.length)warnings.push('Sin hueco: '+result.pending.map(p=>p.title+' ('+hours(p.hours)+')').join(', ')+'. Revisa tu disponibilidad.');
 if(result.invalidPins.length)warnings.push('Revisa los bloques fijados: hay un conflicto.');
 if(!storageAvailable)warnings.push('El navegador no permite guardar. Descarga una copia antes de salir.');$('warning').textContent=warnings.join(' ');$('resolveCapacity').hidden=!result.pending.length&&!result.invalidPins.length;
 $('goalCount').textContent=state.tasks.length+state.fixed.length+state.social.length;
 $('emptyState').hidden=state.tasks.length+state.fixed.length+state.social.length>0;
 $('items').innerHTML=['tasks','fixed','social'].flatMap(k=>state[k].map(e=>{
 let info;if(k==='tasks'){const future=result.allStudy.filter(x=>x.id===e.id).reduce((n,x)=>n+x.end-x.start,0);info=e.due+' · '+hours(Planner.completedMinutes(state,e.id)/60)+' / '+hours(e.hours);}else info=k==='fixed'?((e.intervalWeeks||1)===1?'Semanal':(e.intervalWeeks||1)+' semanas')+' · '+e.days.map(d=>['D','L','M','X','J','V','S'][d]).join(', ')+' · '+fmt(e.start)+'–'+fmt(e.end):e.date+' · '+fmt(e.start)+'–'+fmt(e.end);
 return `<div class="item ${k}"><div>${esc(e.title)}<small>${esc(info)}</small>${k==='tasks'?'<span class="goalTrack" aria-hidden="true"><i style="width:'+Math.min(100,Planner.completedMinutes(state,e.id)/(e.hours*60)*100)+'%"></i></span>':''}</div><div class="itemActions"><button data-edit-kind="${k}" data-id="${esc(e.id)}">Editar</button></div></div>`})).join('');
 $('items').innerHTML+=result.invalidPins.map(e=>'<div class="item"><div>'+esc(e.title)+'<small>Bloque manual sin hueco · '+clockLabel(e)+'</small></div><button data-invalid-pin="'+esc(e.key)+'">Ajustar bloque</button></div>').join('');
 const daily=Planner.plan(state,today,1),hour=new Date().getHours()+new Date().getMinutes()/60;
 const dayEvents=daily.events.filter(e=>e.type!=='break').sort((a,b)=>a.start-b.start),next=dayEvents.find(e=>e.type!=='done'&&e.end>hour);
 currentNext=next||null;$('nextTitle').textContent=next?next.title:'Día despejado.';$('nextDescription').textContent=next?(next.start<=hour?'Ahora · ':'Después · ')+fmt(next.start)+'–'+fmt(next.end):'Espacio para ti.';
 const doneToday=state.progress.filter(p=>p.date===today).reduce((n,p)=>n+p.actualMinutes,0);
 $('todayStats').innerHTML='<span><strong>'+doneToday+'</strong> min hechos</span><span><strong>'+Math.round(daily.studyHours*60)+'</strong> por delante</span>';const target=doneToday+Math.round(daily.studyHours*60),percent=target?Math.min(100,Math.round(doneToday/target*100)):0;$('dailyRing').setAttribute('style','--progress:'+percent+'%');$('dailyRing').setAttribute('aria-label',doneToday+' minutos de estudio hechos; '+Math.round(daily.studyHours*60)+' minutos por delante hoy');$('ringMinutes').textContent=doneToday;$('openNext').textContent=next?'Abrir bloque ↗':'Añadir plan ＋';$('todayDate').textContent=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
 dailyItems=dayEvents;renderAgenda();
 const occupied=dayEvents.filter(e=>e.end>hour).map(e=>({start:Math.max(hour,e.start),end:e.end})).sort((a,b)=>a.start-b.start);let cursor=Math.max(hour,8),free=[];const until=Math.min(22,num(state.sleep.bed)>12?num(state.sleep.bed):24);
 for(const e of occupied){if(e.start>cursor&&cursor<until)free.push([cursor,Math.min(e.start,until)]);cursor=Math.max(cursor,e.end)}if(cursor<until)free.push([cursor,until]);free=free.filter(([a,b])=>b-a>=.5);
 $('freeTime').textContent=free.length?free.map(([a,b])=>fmt(a)+'–'+fmt(b)).join(' · ')+' · Incluyen pausas y márgenes.':'No necesitas llenar cada minuto.';
 $('reviewPast').hidden=!daily.unreviewed.length;$('pastSessions').innerHTML=daily.unreviewed.slice(-8).map(e=>`<button class="pastReview" data-past-key="${esc(Planner.sessionKey(e))}">${esc(e.title)} · ${clockLabel(e)} · Registrar</button>`).join('');
 $('todayPanel').hidden=currentView!=='today';$('weekPanel').hidden=currentView!=='week';$('todayNav').setAttribute('aria-current',currentView==='today'?'page':'false');$('weekNav').setAttribute('aria-current',currentView==='week'?'page':'false');$('todayView').setAttribute('aria-pressed',String(currentView==='today'));$('weekView').setAttribute('aria-pressed',String(currentView==='week'));$('undoChange').disabled=!undo;
}
function showView(view){currentView=view;render()}
function renderAgenda(){const list=dailyItems.filter(e=>agendaFilter==='all'||agendaFilter==='study'&&['study','done'].includes(e.type)||agendaFilter==='life'&&!['study','done'].includes(e.type));$('todayAgenda').innerHTML=list.map(e=>eventButton(e)).join('')||'<p class="agendaEmpty"><span aria-hidden="true">✧</span> Sin bloques aquí.</p>';document.querySelectorAll('[data-agenda-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agendaFilter===agendaFilter)));}
function eventError(e,kind,base=state){
 if(!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.start<0||e.end>24||e.end<=e.start)return 'Revisa el horario: debe terminar después de empezar, en el mismo día.';
 if(kind==='social'&&!validDate(e.date))return 'Elige una fecha válida.';
 if(kind==='fixed'&&(!e.days?.length||!Number.isInteger(e.intervalWeeks)||e.intervalWeeks<1||e.intervalWeeks>52||!validDate(e.startsOn)))return 'Selecciona días, frecuencia y semana de referencia.';
 if(Planner.sleepConflict(base.sleep,e.start,e.end))return 'Ese horario coincide con tu descanso.';
 const conflict=base.fixed.some(x=>(kind==='fixed'?Planner.recurringCoincides(x,e):Planner.occursOn(x,e.date))&&Planner.overlap(e,x))||base.social.some(x=>(kind==='fixed'?Planner.occursOn(e,x.date):x.date===e.date)&&Planner.overlap(e,x))||base.tasks.some(t=>(kind==='fixed'?Planner.occursOn(e,t.due):t.due===e.date)&&Planner.overlap(e,{start:num(t.dueTime),end:num(t.dueTime)+(t.duration??1)}));
 return conflict?'Coincide con otro compromiso. Ajusta las horas antes de continuar.':'';
}
function stageProposal(next,description,source,options={}){
 if(!Planner.validState(next))return 'Hay datos inválidos. Revisa el formulario.';
 pendingProposal={next,description,source,options,revision,base:calculate(),plan:calculate(next)};
 if(source&&$(source).open)$(source).close();drawProposal();$('proposalModal').showModal();return '';
}
function drawProposal(){
 const q=pendingProposal;if(!q)return;q.plan=calculate(q.next);const increased=q.plan.pending.filter(p=>p.hours>(q.base.pending.find(x=>x.id===p.id)?.hours||0)&&!q.options.allowDeficit&&!q.options.newTaskIds?.includes(p.id));
 q.hardSleep=[...q.next.fixed,...q.next.social.filter(e=>e.date>=today),...q.next.tasks.filter(t=>t.due>=today&&(t.duration??1)>0).map(t=>({start:num(t.dueTime),end:num(t.dueTime)+(t.duration??1)}))].some(e=>Planner.sleepConflict(q.next.sleep,e.start,e.end));
 q.blocked=increased.length>0||q.plan.invalidPins.length>0||q.hardSleep;
 $('proposalDescription').textContent=q.description;
 $('proposalStatus').textContent=q.hardSleep?'Hay compromisos que coinciden con el descanso. Ajusta las horas antes de aplicar.':q.plan.invalidPins.length?'Hay un bloque fijado que coincide con tus compromisos o preferencias. Ajústalo antes de guardar.':increased.length?'Este cambio deja estudio sin hueco. Prueba otra disponibilidad o ajusta la propuesta.':q.plan.pending.length?'Quedan horas sin hueco. Seguirán pendientes si guardas.':'Todo encaja. Tú decides si guardarlo.';
 $('proposalGoals').innerHTML=q.next.tasks.map(t=>{const done=Planner.completedMinutes(q.next,t.id)/60,future=q.plan.allStudy.filter(e=>e.id===t.id).reduce((n,e)=>n+e.end-e.start,0),missing=q.plan.pending.find(e=>e.id===t.id)?.hours||0;return `<div class="goalReview"><strong>${esc(t.title)}</strong><span><i>${hours(done)} hechas</i><i>${hours(future)} previstas</i>${missing?'<i class="shortage">'+hours(missing)+' sin hueco</i>':''}</span></div>`}).join('')||'<p class="formHint">No hay objetivos de estudio afectados.</p>';
 const diff=Planner.changes(q.base,q.plan);$('proposalChangesTitle').textContent=diff.removed.length+' bloques cambian · '+diff.added.length+' nuevos huecos';const list=events=>events.slice(0,30).map(e=>`<p>${esc(e.title)}<small>${clockLabel(e)}</small></p>`).join('')+(events.length>30?'<p>Y '+(events.length-30)+' bloques más.</p>':'');$('proposalBefore').innerHTML=list(diff.removed)||'<p>Sin cambios.</p>';$('proposalAfter').innerHTML=list(diff.added)||'<p>Sin cambios.</p>';
 $('adjustProposal').disabled=!q.source;$('proposalAlternatives').hidden=!q.plan.pending.length;$('applyProposal').disabled=q.blocked;$('applyProposal').textContent=q.plan.pending.length&&!q.blocked?'Guardar con horas pendientes':'Aplicar cambios';
 q.signature=JSON.stringify([q.plan.allStudy,q.plan.pending,q.plan.invalidPins]);
}
function cancelProposal(adjust=false){const q=pendingProposal;pendingProposal=null;$('proposalModal').close();if(adjust&&q?.source)$(q.source).showModal()}
function applyProposal(){
 const q=pendingProposal;if(!q||q.blocked)return;if(q.revision!==revision){$('proposalStatus').textContent='El calendario ha cambiado. Cancela y prepara una nueva propuesta.';$('applyProposal').disabled=true;return;}
 const fresh=calculate(q.next);if(JSON.stringify([fresh.allStudy,fresh.pending,fresh.invalidPins])!==q.signature){drawProposal();$('proposalStatus').textContent='Ha pasado tiempo: hemos actualizado los huecos. Revisa la propuesta y vuelve a aplicar.';return;}
 checkpoint();state=q.next;pendingProposal=null;editing=null;$('proposalModal').close();save();toast('Plan actualizado. Puedes deshacer el cambio.');
}
function addEvent(e,kind){
 let next=structuredClone(state),source='modal';
 if(editing&&editing.kind==='study'){
  const original=editing.event;next.pins=next.pins.filter(p=>p.key!==original.key);next.skips.push({...original,key:Planner.sessionKey(original)});
  next.pins.push({id:original.id,title:original.title,key:'pin-'+crypto.randomUUID(),sourceKey:Planner.sessionKey(original),date:e.date,start:e.start,end:e.end,type:'study'});
  return stageProposal(next,'Ajustar este bloque y repartir el resto de horas del objetivo.',source);
 }
 if(editing){if(editing.kind==='fixed'&&editing.scope==='all')next.fixed=next.fixed.filter(x=>x.id!==editing.id);else next=Planner.removeEntry(next,editing.kind,editing.id,editing.date,editing.scope);if(editing.kind==='fixed'&&editing.scope==='one'){e.sourceFixedId=editing.id;}else e.id=editing.id;}
 const error=eventError(e,kind,next);if(error)return error;next[kind].push(e);return stageProposal(next,editing?.kind==='fixed'&&editing.scope==='all'?'Actualizar «'+e.title+'»: cada '+(e.intervalWeeks||1)+' semana(s), desde la semana del '+e.startsOn+'.':editing?'Cambiar solo esta sesión. El resto de la rutina se conserva.':'Añadir «'+e.title+'» cuidando las horas de estudio.',source);
}
function changeSleep(bed,hours){
 if(!validTime(bed)||!Number.isFinite(hours)||hours<4||hours>12)return 'Revisa la hora y las horas de sueño.';
 const next=structuredClone(state);next.sleep={bed,hours};if([...next.fixed,...next.social.filter(e=>e.date>=today)].some(e=>Planner.sleepConflict(next.sleep,e.start,e.end)))return 'Ese descanso coincide con una rutina o un plan. Ajusta primero ese compromiso.';
 return stageProposal(next,'Proteger '+hours+' horas de sueño y revisar la distribución de estudio.',$('modal').open?'modal':'sleepModal');
}
function submitEntry(e){
 e.preventDefault();const kind=$('kind').value,title=$('title').value.trim();let error='';
 if(kind==='sleep')error=changeSleep($('entryBed').value,Number($('entrySleepHours').value));
 else if(!title||title.length>100)error='Escribe un nombre de hasta 100 caracteres.';
 else if(kind==='task'){
  const due=$('due').value,dueTime=$('dueTime').value,total=Number($('hours').value),duration=Number($('examDuration').value);
  if(!validDate(due)||!validTime(dueTime)||due>addDays(today,365)||due<today)error='Elige una fecha entre hoy y dentro de un año.';
  else if(!Number.isFinite(total)||total<=0||total>300||!Number.isInteger(total*2)||!Number.isFinite(duration)||duration<0||duration>8||num(dueTime)+duration>24)error='Revisa las horas totales y la duración del examen.';
  else {const id=editing?.id||crypto.randomUUID(),next=structuredClone(state);if(total*60<Planner.completedMinutes(next,id))error='Las horas totales no pueden ser menores que el progreso ya registrado.';else{const task={id,title,due,dueTime,hours:total,duration,difficulty:Number($('difficulty').value)||2};next.tasks=next.tasks.filter(t=>t.id!==id);next.tasks.push(task);error=stageProposal(next,'Revisar el objetivo y su preparación antes del examen.','modal',{newTaskIds:editing?[]:[id]});}}
 }else{
  const event={id:crypto.randomUUID(),title,start:num($('from').value),end:num($('to').value)};
  if(kind==='fixed'){event.days=[...document.querySelectorAll('input[name="days"]:checked')].map(x=>Number(x.value));event.intervalWeeks=$('repeatWeeks').value==='custom'?Number($('customRepeatWeeks').value):Number($('repeatWeeks').value);event.startsOn=validDate($('repeatStart').value)?monday($('repeatStart').value):'';if(editing?.scope==='all')event.exceptions=state.fixed.find(x=>x.id===editing.id)?.exceptions||[];}else event.date=$('eventDate').value;
  if(!validTime($('from').value)||!validTime($('to').value))error='Escribe las horas con formato HH:MM.';else error=addEvent(event,kind==='fixed'?'fixed':'social');
 }
 if(error)$('formError').textContent=error;
}
function prepareEditor(){
 $('kind').disabled=false;$('tabFixed').disabled=false;$('tabNew').disabled=false;$('title').readOnly=false;$('editingScope').hidden=true;$('deleteEntry').hidden=true;$('deleteRoutineActions').hidden=true;$('difficulty').value='2';
}
const originalOpenEntry=openEntry;
openEntry=function(next='fixed'){editing=null;prepareEditor();originalOpenEntry(next);$('entryTitle').textContent='Añadir a tu calendario';$('saveEntry').textContent='Revisar propuesta';};
function openEdit(kind,id,date=null,scope='all',event=null){
 openEntry(kind==='social'||kind==='study'?'new':'fixed');editing={kind,id,date,scope,event};fillEditor();
}
function fillEditor(){
 const ref=editing;if(!ref)return;let value=ref.kind==='study'?ref.event:state[ref.kind].find(e=>e.id===ref.id);if(!value)return;
 const one=ref.kind==='fixed'&&ref.scope==='one',kind=ref.kind==='tasks'?'task':ref.kind==='fixed'&&!one?'fixed':'social';
 setMode(kind==='social'?'new':'fixed');$('kind').value=kind;updateFields();$('kind').disabled=true;$('tabFixed').disabled=true;$('tabNew').disabled=true;
 $('entryTitle').textContent=ref.kind==='study'?'Ajustar bloque de estudio':'Editar '+(ref.kind==='tasks'?'objetivo':one?'esta sesión':'horario');$('title').value=value.title;
 $('editingScope').hidden=ref.kind!=='fixed';$('scopeAll').setAttribute('aria-pressed',String(!one));$('scopeOne').setAttribute('aria-pressed',String(one));$('scopeOne').disabled=!ref.date;$('scopeHint').textContent=one?'La repetición del resto no cambia.':'La periodicidad se aplica a toda la rutina.';$('deleteRoutineActions').hidden=ref.kind!=='fixed';$('deleteOccurrence').hidden=!ref.date;$('deleteEntry').hidden=ref.kind==='fixed';$('deleteEntry').textContent=ref.kind==='study'?'Liberar y recolocar este bloque':one?'Cancelar solo esta sesión':'Eliminar '+(ref.kind==='fixed'?'toda la rutina':'elemento');
 if(kind==='task'){$('due').value=value.due;$('dueTime').value=value.dueTime;$('hours').value=value.hours;$('examDuration').value=value.duration;$('difficulty').value=value.difficulty||2;}
 else{$('from').value=fmt(value.start);$('to').value=fmt(value.end);$('eventDate').value=ref.date||value.date||today;if(kind==='fixed'){document.querySelectorAll('input[name="days"]').forEach(c=>{c.checked=value.days.includes(Number(c.value))});const interval=value.intervalWeeks||1;$('repeatWeeks').value=interval<=4?String(interval):'custom';$('customRepeatWeeks').value=interval;$('repeatStart').value=value.startsOn||week;updateRepeatPreview();}}
 if(ref.kind==='study'){$('title').readOnly=true;$('title').value=ref.event.title;}
}
function openSession(e){currentSession=e;$('sessionTitle').textContent=e.title;$('sessionInfo').textContent=clockLabel(e)+' · '+Math.round((e.end-e.start)*60)+' min previstos';const existing=state.progress.find(p=>p.key===Planner.sessionKey(e));$('progressStatus').value=existing?.status||'done';$('actualMinutes').max=Math.round((e.end-e.start)*60);$('actualMinutes').value=existing?.actualMinutes??Math.round((e.end-e.start)*60);$('actualMinutesLabel').hidden=$('progressStatus').value!=='partial';$('actualMinutes').required=$('progressStatus').value==='partial';$('actualMinutes').disabled=$('progressStatus').value!=='partial';$('progressError').textContent='';$('editSession').disabled=!!existing||e.date<today||e.date===today&&e.start<new Date().getHours()+new Date().getMinutes()/60;$('sessionModal').showModal()}
function findEvent(key){return [...result.events,...Planner.plan(state,today,1).events].find(e=>e.key===key)}
function handleEventClick(e){const button=e.target.closest('[data-event-key]');if(!button)return;const event=findEvent(button.dataset.eventKey);if(!event)return;if(event.type==='rest'||event.type==='break'){openStudyPrefs();return}if(event.type==='study'||event.type==='done'){openSession(event);return}openEdit(event.type==='exam'?'tasks':event.type,event.id,event.date,'all');}
function openStudyPrefs(){if($('tour').open)return;const p=state.studyPrefs;
 const fields={studyStart:p.start,studyEnd:p.end,sessionLength:p.sessionMinutes,breakLength:p.breakMinutes,travelBuffer:p.bufferMinutes,reserveTime:p.reserveMinutes,dailyLimit:p.maxDailyHours,taskDailyLimit:p.maxTaskDailyHours,preferredPeriod:p.preferredPeriod,lunchStart:p.lunchStart,lunchEnd:p.lunchEnd};for(const [id,value] of Object.entries(fields))$(id).value=value;
 document.querySelectorAll('input[name="daysOff"]').forEach(c=>{c.checked=p.daysOff.includes(Number(c.value))});$('lunchEnabled').checked=p.lunchEnabled;$('studyPrefsError').textContent='';if($('settingsModal').open)$('settingsModal').close();$('studyPrefsModal').showModal();
}
function setupEnhancements(){
 $('openNext').onclick=()=>{const e=currentNext;if(!e){openEntry('new');return}if(['rest','break'].includes(e.type))openStudyPrefs();else if(e.type==='study'||e.type==='done')openSession(e);else openEdit(e.type==='exam'?'tasks':e.type,e.id,e.date,'all');};
 document.querySelectorAll('[data-agenda-filter]').forEach(b=>{b.onclick=()=>{agendaFilter=b.dataset.agendaFilter;renderAgenda()}});
 $('goalsNav').onclick=()=>{$('goalsDisclosure').open=true;$('details').scrollIntoView({behavior:'smooth'})};
 $('todayNav').onclick=()=>showView('today');$('weekNav').onclick=()=>showView('week');$('todayView').onclick=()=>showView('today');$('weekView').onclick=()=>showView('week');
 $('resolveCapacity').onclick=()=>stageProposal(structuredClone(state),'Revisar alternativas para las horas que no caben.',null);$('quickStudyPrefs').onclick=openStudyPrefs;$('studyPrefsButton').onclick=openStudyPrefs;$('closeStudyPrefs').onclick=()=>$('studyPrefsModal').close();
 $('calendar').onclick=handleEventClick;$('weekAgenda').onclick=handleEventClick;$('todayAgenda').onclick=handleEventClick;
 $('pastSessions').onclick=e=>{const b=e.target.closest('[data-past-key]');if(!b)return;const event=calculate().unreviewed.find(x=>Planner.sessionKey(x)===b.dataset.pastKey);if(event)openSession(event)};
 $('items').onclick=e=>{const pin=e.target.closest('[data-invalid-pin]');if(pin){const event=result.invalidPins.find(x=>x.key===pin.dataset.invalidPin);if(event)openEdit('study',event.id,event.date,'one',event);return;}const b=e.target.closest('[data-edit-kind]');if(b)openEdit(b.dataset.editKind,b.dataset.id)};
 $('scopeAll').onclick=()=>setEditScope('all');$('scopeOne').onclick=()=>setEditScope('one');$('deleteOccurrence').onclick=()=>deleteRoutine('one');$('deleteSeries').onclick=()=>deleteRoutine('all');
 $('deleteEntry').onclick=()=>{if(!editing)return;let next;if(editing.kind==='study'){next=structuredClone(state);next.pins=next.pins.filter(p=>p.key!==editing.event.key);next.skips.push({...editing.event,key:Planner.sessionKey(editing.event)});}else next=Planner.removeEntry(state,editing.kind,editing.id,editing.date,editing.scope);stageProposal(next,editing.kind==='tasks'?'Eliminar este objetivo y su historial de estudio. Revisa el resto del plan.':'Revisar la eliminación y el nuevo reparto.','modal');};
 $('applyProposal').onclick=applyProposal;$('cancelProposal').onclick=()=>cancelProposal();$('cancelProposalTop').onclick=()=>cancelProposal();$('adjustProposal').onclick=()=>cancelProposal(true);$('proposalModal').oncancel=e=>{e.preventDefault();cancelProposal()};
 $('tryMoreTime').onclick=()=>{if(!pendingProposal)return;const p=pendingProposal.next.studyPrefs;p.maxDailyHours=Math.min(10,p.maxDailyHours+1);p.maxTaskDailyHours=Math.min(6,p.maxTaskDailyHours+1);pendingProposal.description+=' · Propuesta: límites diarios aumentados en 1 h (hasta los máximos permitidos).';drawProposal()};
 $('tryFreeDays').onclick=()=>{if(!pendingProposal)return;pendingProposal.next.studyPrefs.daysOff=[];pendingProposal.description+=' · Propuesta: estudiar también en los días antes libres.';drawProposal()};
 $('tryLongerWindow').onclick=()=>{if(!pendingProposal)return;const p=pendingProposal.next.studyPrefs;p.end=fmt(Math.min(23.75,num(p.end)+1));pendingProposal.description+=' · Propuesta: disponibilidad ampliada hasta '+p.end+', respetando el sueño.';drawProposal()};
 $('tryMoreTime').textContent='Probar +1 h en los límites diarios';
 $('undoChange').onclick=()=>{if(!undo)return;const previous=undo,cosmetic=state.preferences;undo=structuredClone(state);state=previous;state.preferences=cosmetic;editing=null;save();toast('Cambio deshecho.');};
 $('studyPrefsForm').onsubmit=e=>{e.preventDefault();const p={start:$('studyStart').value,end:$('studyEnd').value,sessionMinutes:Number($('sessionLength').value),breakMinutes:Number($('breakLength').value),bufferMinutes:Number($('travelBuffer').value),reserveMinutes:Number($('reserveTime').value),maxDailyHours:Number($('dailyLimit').value),maxTaskDailyHours:Number($('taskDailyLimit').value),preferredPeriod:$('preferredPeriod').value,daysOff:[...document.querySelectorAll('input[name="daysOff"]:checked')].map(x=>Number(x.value)),lunchEnabled:$('lunchEnabled').checked,lunchStart:$('lunchStart').value,lunchEnd:$('lunchEnd').value};if(!Planner.validStudyPrefs(p)){$('studyPrefsError').textContent='Revisa las horas y los límites de estudio.';return}const next=structuredClone(state);next.studyPrefs=p;stageProposal(next,'Revisar tus sesiones, pausas, comidas, márgenes y días libres.','studyPrefsModal');};
 $('progressStatus').onchange=()=>{const partial=$('progressStatus').value==='partial';$('actualMinutesLabel').hidden=!partial;$('actualMinutes').disabled=!partial;$('actualMinutes').required=partial;};
 $('progressForm').onsubmit=e=>{e.preventDefault();if(!currentSession)return;try{const next=Planner.recordProgress(state,currentSession,$('progressStatus').value,Number($('actualMinutes').value));stageProposal(next,'Registrar lo estudiado de verdad y repartir lo pendiente.','sessionModal',{allowDeficit:true});}catch(error){$('progressError').textContent=error.message}};
 $('closeSession').onclick=()=>$('sessionModal').close();$('editSession').onclick=()=>{if(!currentSession)return;$('sessionModal').close();openEdit('study',currentSession.id,currentSession.date,'one',currentSession)};
 $('close').onclick=()=>{$('modal').close();editing=null};
 $('restore').onchange=async e=>{try{const restored=migrate(JSON.parse(await e.target.files[0].text()));stageProposal(restored,'Restaurar esta copia sustituirá el horario, progreso y preferencias actuales.',null,{allowDeficit:true});}catch{toast('No se pudo leer esa copia de Brisa.')}e.target.value=''};
 $('chat').onsubmit=e=>{e.preventDefault();const raw=$('prompt').value,text=raw.toLowerCase();let message;editing=null;
 if(text.includes('deshacer')){$('undoChange').onclick();message='He recuperado el plan anterior si había un cambio para deshacer.';}
 else if(text.includes('dormir')){const h=text.match(/(\d+(?:[.,]\d+)?)\s*horas/);if(h){const next=structuredClone(state);next.sleep.hours=Number(h[1].replace(',','.'));if(next.sleep.hours<4||next.sleep.hours>12)message='Elige entre 4 y 12 horas de descanso.';else message=stageProposal(next,'Revisar tu nuevo descanso y el estudio.',null)||'He preparado una propuesta. Revisa los cambios antes de aplicarlos.';}else message='Prueba «Quiero dormir 8 horas».';}
 else {const times=[...text.matchAll(/\b(\d{1,2}):([0-5]\d)\b/g)].map(m=>+m[1]+ +m[2]/60),date=text.match(/\b\d{4}-\d{2}-\d{2}\b/),normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,''),di=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].findIndex(n=>normalized.includes(n));if(times.length===2&&times.every(h=>h<24)&&(date||di>=0)){const event={id:crypto.randomUUID(),title:(raw.split(/\s+(?:el|de|desde)\s/i)[0].trim()||'Plan personal').slice(0,100),date:date?date[0]:addDays(week,di),start:times[0],end:times[1]},error=eventError(event,'social');if(error)message=error;else{const next=structuredClone(state);next.social.push(event);message=stageProposal(next,'Añadir «'+event.title+'» y revisar qué se mueve.',null)||'Revisa la propuesta: todavía no he modificado tu calendario.';}}else message='Prueba «Cena el viernes de 20:00 a 22:00» (semana visible), una fecha YYYY-MM-DD, o usa los formularios.';}
 $('reply').textContent=message;$('prompt').value='';};
}
setupEnhancements();

function setEditScope(scope){
 if(!editing||editing.kind!=='fixed'||scope==='one'&&!editing.date)return;
 const values={title:$('title').value,from:$('from').value,to:$('to').value,eventDate:$('eventDate').value};
 if(editing.scope==='all')editing.repeatDraft={repeat:$('repeatWeeks').value,custom:$('customRepeatWeeks').value,start:$('repeatStart').value,days:[...document.querySelectorAll('input[name="days"]:checked')].map(x=>Number(x.value))};
 editing.scope=scope;fillEditor();for(const [id,value] of Object.entries(values))$(id).value=value;
 if(scope==='all'&&editing.repeatDraft){const d=editing.repeatDraft;$('repeatWeeks').value=d.repeat;$('customRepeatWeeks').value=d.custom;$('repeatStart').value=d.start;document.querySelectorAll('input[name="days"]').forEach(c=>{c.checked=d.days.includes(Number(c.value))});updateRepeatPreview();}
}
function deleteRoutine(scope){
 if(!editing||editing.kind!=='fixed'||scope==='one'&&!editing.date)return;
 const routine=state.fixed.find(e=>e.id===editing.id);if(!routine)return;
 const next=Planner.removeEntry(state,'fixed',editing.id,editing.date,scope);
 const message=scope==='all'?'Eliminar toda la rutina «'+routine.title+'» de todas las semanas, incluidas sus excepciones.':'Eliminar solo la sesión del '+editing.date+'. Las demás semanas se conservan.';
 stageProposal(next,message,'modal');
}
