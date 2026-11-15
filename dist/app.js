'use strict';
const $=id=>document.getElementById(id);
const {iso,addDays,num,validDate,validTime}=Planner;
const monday=s=>addDays(s,-((new Date(s+'T12:00:00').getDay()+6)%7));
const fmt=h=>`${String(Math.floor(h)).padStart(2,'0')}:${String(Math.round(h%1*60)).padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='brisa-v2',TOUR_KEY='brisa-tutorial-v1';
let today=iso(new Date()),week=monday(today),undo=null,result,mode='fixed',tourStep=0,storageAvailable=true;
const initial={version:2,sleep:{bed:'23:00',hours:8},tasks:[],fixed:[],social:[],study:[],tutorialDone:false,preferences:{name:'',theme:'green'}};
function readStorage(key){try{return localStorage.getItem(key)}catch{storageAvailable=false;return null}}
function writeStorage(key,value){try{localStorage.setItem(key,value);return true}catch{storageAvailable=false;return false}}
function migrate(s){if(!Planner.validState(s))throw Error('Invalid data');return {...s,version:2,tasks:s.tasks.map(t=>({...t,dueTime:t.dueTime||'09:00',duration:t.duration??1})),study:s.study||[],tutorialDone:!!s.tutorialDone,preferences:s.preferences||{name:'',theme:'green'}}}
let state;
try{const saved=readStorage(STORAGE)||readStorage('brisa-v1');state=saved?migrate(JSON.parse(saved)):structuredClone(initial)}catch{state=structuredClone(initial)}
function calculate(s=state){return Planner.plan(s,week)}
function storePlan(){result=calculate();state.study=result.allStudy;writeStorage(STORAGE,JSON.stringify(state))}
function save(){storePlan();render()}
function checkpoint(){undo=structuredClone(state)}
function toast(message){$('toast').textContent=message;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',6500)}
function render(){
 applyPreferences();
 result=calculate();
 $('todayLabel').textContent=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
 $('focus').textContent=result.studyHours+' h esta semana';$('sleepStat').textContent=state.sleep.hours+' h cada noche';$('bedStat').textContent='A dormir a las '+state.sleep.bed;
 $('socialStat').textContent=state.social.filter(e=>e.date>=week&&e.date<addDays(week,7)).length+' planes personales';
 $('range').textContent=new Date(week+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})+' — '+new Date(addDays(week,6)+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
 $('sleepFooter').textContent=state.sleep.bed+' — '+fmt((num(state.sleep.bed)+state.sleep.hours)%24);
 let html='<div></div>';
 for(let i=0;i<7;i++){const d=addDays(week,i);html+=`<div class="dayhead ${d===today?'today':''}">${['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'][i]}<strong>${Number(d.slice(-2))}</strong></div>`}
 html+='<div class="timecol">';for(let h=8;h<=22;h+=2)html+=`<span class="time" style="top:${(h-8)/14*100}%">${fmt(h)}</span>`;html+='</div>';
 for(let i=0;i<7;i++){const d=addDays(week,i);html+='<div class="daycol">';for(const e of result.events.filter(e=>e.date===d&&e.end>8&&e.start<22)){
 const start=Math.max(8,e.start),end=Math.min(22,e.end);html+=`<div class="event ${e.type}" style="top:${(start-8)/14*100}%;height:${(end-start)/14*100}%" title="${esc(e.title)} · ${fmt(e.start)}–${fmt(e.end)}"><b>${esc(e.title)}</b><small>${fmt(e.start)}–${fmt(e.end)}</small></div>`}html+='</div>'}
 $('calendar').innerHTML=html;
 $('upcoming').innerHTML=[...state.tasks].sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3).map(t=>{
 const allocated=result.allStudy.filter(e=>e.id===t.id).reduce((n,e)=>n+e.end-e.start,0);
 return `<div class="deadline"><div class="datebox">${new Date(t.due+'T12:00:00').toLocaleDateString('es',{month:'short'})}<strong>${Number(t.due.slice(-2))}</strong></div><div><p>${esc(t.title)}</p><small>${t.due<today?'La fecha ha pasado. Revisa cómo ha ido.':t.due===today?'Es hoy. Un paso a la vez.':`En ${Math.round((new Date(t.due+'T12:00:00')-new Date(today+'T12:00:00'))/86400000)} días`} · ${esc(t.dueTime)}</small><small class="taskPlan">${allocated} de ${t.hours} h repartidas hasta el examen</small></div></div>`}).join('')||'<p class="formHint">Añade un examen y repartiremos tu preparación, un día a la vez.</p>';
 const warnings=[];if(result.pending.length)warnings.push('No caben todas las horas antes de sus fechas: '+result.pending.map(p=>p.title+' ('+p.hours+' h sin hueco)').join(', ')+'. Revisa tus compromisos o las horas solicitadas.');
 if(!storageAvailable)warnings.push('Este navegador no permite guardar cambios. Descarga una copia antes de salir.');
 $('warning').textContent=warnings.join(' ');
 $('emptyState').hidden=state.tasks.length+state.fixed.length+state.social.length>0;
 $('items').innerHTML=['tasks','fixed','social'].flatMap(k=>state[k].map(e=>{
 let info;if(k==='tasks'){const study=result.allStudy.filter(x=>x.id===e.id),hours=study.reduce((n,x)=>n+x.end-x.start,0),days=new Set(study.map(x=>x.date)).size;info=`${e.due} a las ${e.dueTime} · ${hours}/${e.hours} h en ${days} días`;}else info=k==='fixed'?'Cada '+(e.intervalWeeks||1)+' semana'+((e.intervalWeeks||1)>1?'s':'')+(e.startsOn?' · desde semana del '+e.startsOn:'')+' · '+e.days.map(d=>['D','L','M','X','J','V','S'][d]).join(', ')+' · '+fmt(e.start)+'–'+fmt(e.end):e.date+' · '+fmt(e.start)+'–'+fmt(e.end);
 return `<div class="item"><div>${esc(e.title)}<small>${esc(info)}</small></div><div class="itemActions">${k==='tasks'?`<button class="jump" data-jump="${esc(e.due)}">Ver examen</button>`:''}<button data-kind="${k}" data-id="${esc(e.id)}" aria-label="Eliminar ${esc(e.title)}">×</button></div></div>`})).join('');
}
function protectionError(next){const before=calculate(),after=calculate(next);if(after.pending.some(p=>p.hours>(before.pending.find(b=>b.id===p.id)?.hours||0)))return 'Ese cambio deja horas de estudio sin hueco antes del examen. Prueba otra hora; tu calendario no ha cambiado.';return ''}
function eventError(e,kind){
 if(!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.start<0||e.end>24||e.end<=e.start)return 'La hora final debe ser posterior a la inicial. Divide los planes que crucen medianoche.';
 if(kind==='social'&&(!validDate(e.date)||e.date<today))return 'Elige una fecha válida a partir de hoy.';
 const clock=new Date(),hour=clock.getHours()+clock.getMinutes()/60;
 if(kind==='social'&&e.date===today&&e.start<hour)return 'Elige una hora futura para tu plan.';
 const onToday=kind==='fixed'?Planner.occursOn(e,today):e.date===today;
 if(onToday&&(state.study||[]).some(x=>x.date===today&&x.start<hour&&x.end>hour&&e.start<x.end&&e.end>x.start))return 'Ese bloque de estudio ya ha empezado. Elige un hueco después para conservarlo.';
 if(Planner.sleepConflict(state.sleep,e.start,e.end))return 'Ese horario coincide con tu descanso. Ajusta la hora o tu preferencia de sueño.';
 if(kind==='fixed'&&(!e.days.length||e.days.some(d=>d<0||d>6)))return 'Selecciona al menos un día.';
 if(kind==='fixed'&&(!Number.isInteger(e.intervalWeeks)||e.intervalWeeks<1||e.intervalWeeks>52||!validDate(e.startsOn)))return 'Elige la semana de referencia y un intervalo de 1 a 52 semanas.';
 const conflictsFixed=state.fixed.some(x=>(kind==='fixed'?Planner.recurringCoincides(x,e):Planner.occursOn(x,e.date))&&e.start<x.end&&e.end>x.start);
 const conflictsSocial=state.social.some(x=>(kind==='fixed'?Planner.occursOn(e,x.date)&&x.date>=today:x.date===e.date)&&e.start<x.end&&e.end>x.start);
 const conflictsExam=state.tasks.some(t=>(kind==='fixed'?t.due>=today&&Planner.occursOn(e,t.due):t.due===e.date)&&e.start<num(t.dueTime)+(t.duration??1)&&e.end>num(t.dueTime));
 if(conflictsFixed||conflictsSocial||conflictsExam)return 'Coincide con una rutina, un plan o un examen. Revisa ese compromiso primero.';return '';
}
function addEvent(e,kind){const error=eventError(e,kind);if(error)return error;const next=structuredClone(state);next[kind].push(e);const conflict=protectionError(next);if(conflict)return conflict;checkpoint();state=next;if(kind==='social')week=monday(e.date);save();return ''}
function changeSleep(bed,hours){
 if(!validTime(bed)||!Number.isFinite(hours)||hours<4||hours>12)return 'Revisa la hora y las horas de sueño (entre 4 y 12).';
 const next=structuredClone(state);next.sleep={bed,hours};
 const clock=new Date(),hour=clock.getHours()+clock.getMinutes()/60;
 if((state.study||[]).some(e=>e.date===today&&e.start<hour&&e.end>hour&&Planner.sleepConflict(next.sleep,e.start,e.end)))return 'El nuevo descanso coincide con el estudio que ya ha empezado. Prueba otra hora.';
 if([...state.fixed,...state.social.filter(e=>e.date>=today),...state.tasks.filter(t=>t.due>=today).map(t=>({start:num(t.dueTime),end:Math.min(24,num(t.dueTime)+(t.duration??1))}))].some(e=>Planner.sleepConflict(next.sleep,e.start,e.end)))return 'Ese descanso coincide con un compromiso. Ajusta primero el horario de ese compromiso.';
 const conflict=protectionError(next);if(conflict)return conflict;checkpoint();state=next;save();return '';
}
function updateFields(){
 const kind=$('kind').value,isTask=kind==='task',isSleep=kind==='sleep',isEvent=kind==='fixed'||kind==='social';
 $('taskFields').hidden=!isTask;$('eventFields').hidden=!isEvent;$('entrySleepFields').hidden=!isSleep;$('titleLabel').hidden=isSleep;$('daysLabel').hidden=kind!=='fixed';$('dateLabel').hidden=kind!=='social';$('recurrenceFields').hidden=kind!=='fixed';$('routineExamples').hidden=kind!=='fixed';
 // Disable inactive inputs as well as hiding them, so native validation never blocks another mode.
 for(const [id,active] of [['title',!isSleep],['due',isTask],['dueTime',isTask],['hours',isTask],['examDuration',isTask],['eventDate',kind==='social'],['from',isEvent],['to',isEvent],['entryBed',isSleep],['entrySleepHours',isSleep],['repeatWeeks',kind==='fixed'],['repeatStart',kind==='fixed'],['customRepeatWeeks',kind==='fixed'&&$('repeatWeeks').value==='custom']]){$(id).disabled=!active;$(id).required=active;}
 $('title').placeholder=isTask?'Ej.: Examen de matemáticas':kind==='social'?'Ej.: Gimnasio o cena con amigos':'Ej.: Clases, trabajo o transporte';
 $('formError').textContent='';updateRepeatPreview();
}
function setMode(next){mode=next;$('tabFixed').setAttribute('aria-pressed',String(mode==='fixed'));$('tabNew').setAttribute('aria-pressed',String(mode==='new'));$('kind').innerHTML=mode==='fixed'?'<option value="fixed">Clases, trabajo, transporte o rutina semanal</option><option value="task">Examen y horas de estudio</option><option value="sleep">Horas de sueño</option>':'<option value="social">Evento social, gimnasio o plan puntual</option>';$('kind').value=mode==='fixed'?'fixed':'social';$('modeHint').textContent=mode==='fixed'?'Lo que marca tu ritmo: rutinas, preparación de exámenes y descanso.':'Algo para un día concreto. Buscaremos hueco sin recortar tu estudio.';updateFields()}
function openEntry(next='fixed'){
 if($('tour').open)return;
 $('title').value='';$('due').value=addDays(today,20);$('due').min=today;$('due').max=addDays(today,365);$('eventDate').value=week>today?week:today;$('eventDate').min=today;
 $('repeatWeeks').value='1';$('repeatStart').value=week;
 $('entryBed').value=state.sleep.bed;$('entrySleepHours').value=state.sleep.hours;setMode(next);$('modal').showModal();
}
$('add').onclick=()=>openEntry('fixed');$('addNew').onclick=()=>openEntry('new');$('firstEntry').onclick=()=>openEntry('fixed');$('close').onclick=()=>$('modal').close();$('kind').onchange=updateFields;$('tabFixed').onclick=()=>setMode('fixed');$('tabNew').onclick=()=>setMode('new');
$('entry').onsubmit=e=>{
 e.preventDefault();const kind=$('kind').value,title=$('title').value.trim();let error='';
 if(kind==='sleep')error=changeSleep($('entryBed').value,Number($('entrySleepHours').value));
 else if(!title||title.length>100)error='Escribe un nombre de hasta 100 caracteres.';
 else if(kind==='task'){
  const due=$('due').value,dueTime=$('dueTime').value,hours=Number($('hours').value),duration=Number($('examDuration').value);
  if(!validDate(due)||due<today||due>addDays(today,365)||!validTime(dueTime)||due===today&&num(dueTime)<new Date().getHours()+new Date().getMinutes()/60)error='Indica una fecha y hora futuras, dentro del próximo año.';
  else if(!Number.isFinite(hours)||hours<=0||hours>300||!Number.isInteger(hours*2))error='Usa entre 0,5 y 300 horas, en pasos de media hora.';
  else if(!Number.isFinite(duration)||duration<0||duration>8||num(dueTime)+duration>24)error='Revisa la duración: el examen debe terminar en el mismo día.';
  else {const next=structuredClone(state);next.tasks.push({id:crypto.randomUUID(),title,due,dueTime,hours,duration});checkpoint();state=next;save();}
 }else{
  const event={id:crypto.randomUUID(),title,start:num($('from').value),end:num($('to').value)};
  if(kind==='fixed'){event.days=[...document.querySelectorAll('input[name="days"]:checked')].map(o=>Number(o.value));event.intervalWeeks=$('repeatWeeks').value==='custom'?Number($('customRepeatWeeks').value):Number($('repeatWeeks').value);event.startsOn=validDate($('repeatStart').value)?monday($('repeatStart').value):'';}else event.date=$('eventDate').value;
  error=addEvent(event,kind==='fixed'?'fixed':'social');
 }
 if(error){$('formError').textContent=error;return}$('modal').close();toast('Guardado. Tu calendario está actualizado.');
};
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
 ['✳','Bienvenido a tu espacio','Vamos a conocer Brisa con cinco explicaciones cortas. Cierra cada tarjeta para pasar a la siguiente. Al terminar podrás añadir tu primer horario.','Sin prisas. Aquí el estudio, el descanso y tu vida tienen su sitio.'],
 ['▦','Primero, lo que ya tiene su sitio','En Horario fijo puedes añadir tus clases, tu trabajo, el sueño y la preparación de tus exámenes. Las rutinas, incluido el transporte, se repiten cada una, dos, tres o las semanas que elijas.','Ejemplo: clases de lunes a viernes, de 09:00 a 14:00.'],
 ['◷','Un examen, un plan repartido','Introduce la fecha y hora del examen y las horas totales que quieres estudiar. Brisa las distribuye entre los días anteriores, incluso si faltan varias semanas.','Ejemplo: un examen dentro de 20 días y 20 h de estudio → preparación repartida según tus huecos.'],
 ['❋','También hay espacio para tus planes','En Horario nuevo añade una cena, una sesión de gimnasio o cualquier evento puntual. El estudio se recoloca antes de sus fechas; si no cabe, te lo diremos sin cambiar el plan.','El asistente también entiende: «Cena el viernes de 20:00 a 22:00».'],
 ['☾','Tu ritmo queda guardado','Cambia de semana con las flechas, ajusta el sueño en Mi ritmo y elige nombre y colores en Ajustes. Tus cambios se guardan automáticamente en este navegador. Este tutorial no volverá a salir al terminarlo.','Aún no hay cuentas ni guardado entre dispositivos. Puedes descargar una copia y volver a ver este tutorial cuando quieras.']
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
 document.documentElement.setAttribute('data-theme',preferences.theme);
 $('greeting').textContent=greeting(new Date(),preferences.name);
 $('userName').textContent=preferences.name||'Tu espacio';$('userAvatar').textContent=preferences.name?Array.from(preferences.name)[0].toUpperCase():'T';
}
function setupPreferences(){
 $('settingsNav').onclick=()=>{if($('tour').open)return;$('preferredName').value=state.preferences.name;document.querySelectorAll('input[name="theme"]').forEach(r=>{r.checked=r.value===state.preferences.theme});$('settingsError').textContent='';$('settingsModal').showModal()};
 $('closeSettings').onclick=()=>$('settingsModal').close();
 $('settingsForm').onsubmit=e=>{e.preventDefault();const name=$('preferredName').value.trim(),theme=document.querySelector('input[name="theme"]:checked')?.value;if(name.length>40||!['green','blue','orange','violet','rose'].includes(theme)){$('settingsError').textContent='Elige una paleta y un nombre de hasta 40 caracteres.';return}state.preferences={name,theme};writeStorage(STORAGE,JSON.stringify(state));applyPreferences();$('settingsModal').close();toast('Tu espacio, a tu manera. Ajustes guardados.');};
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
