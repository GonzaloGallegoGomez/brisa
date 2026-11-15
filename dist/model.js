(function(root){
'use strict';
const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const num=s=>Number(s.split(':')[0])+Number(s.split(':')[1])/60;
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00'))&&iso(new Date(s+'T12:00:00'))===s;
const validTime=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const weekIndex=date=>Math.floor((Date.parse(date+'T00:00:00Z')/86400000+3)/7);
const overlap=(a,b,gap=0)=>a.start<b.end+gap&&a.end>b.start-gap;
function occursOn(e,date){return e.days.includes(new Date(date+'T12:00:00').getDay())&&(!e.startsOn||date>=e.startsOn)&&!(e.exceptions||[]).includes(date)&&(weekIndex(date)-weekIndex(e.startsOn||'1970-01-05'))%(e.intervalWeeks||1)===0}
function recurringCoincides(a,b){const gcd=(x,y)=>y?gcd(y,x%y):x;return a.days.some(d=>b.days.includes(d))&&(weekIndex(a.startsOn||'1970-01-05')-weekIndex(b.startsOn||'1970-01-05'))%gcd(a.intervalWeeks||1,b.intervalWeeks||1)===0}
function sleepConflict(sleep,start,end){const bed=num(sleep.bed),wake=(bed+sleep.hours)%24;return bed>wake?end>bed||start<wake:start<wake&&end>bed}
const defaults=()=>({start:'08:00',end:'22:00',sessionMinutes:60,breakMinutes:15,bufferMinutes:15,reserveMinutes:30,maxDailyHours:6,maxTaskDailyHours:3,preferredPeriod:'any',daysOff:[],lunchEnabled:true,lunchStart:'14:00',lunchEnd:'15:00'});
function validStudyPrefs(p){return p&&validTime(p.start)&&validTime(p.end)&&num(p.end)>num(p.start)&&[30,60,90,120].includes(p.sessionMinutes)&&[0,5,10,15,20,30].includes(p.breakMinutes)&&[0,5,10,15,20,30,45,60].includes(p.bufferMinutes)&&[0,15,30,45,60,90,120].includes(p.reserveMinutes)&&Number.isFinite(p.maxDailyHours)&&p.maxDailyHours>=.5&&p.maxDailyHours<=10&&Number.isFinite(p.maxTaskDailyHours)&&p.maxTaskDailyHours>=.5&&p.maxTaskDailyHours<=6&&['any','morning','afternoon','evening'].includes(p.preferredPeriod)&&Array.isArray(p.daysOff)&&p.daysOff.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&typeof p.lunchEnabled==='boolean'&&validTime(p.lunchStart)&&validTime(p.lunchEnd)&&num(p.lunchEnd)>num(p.lunchStart)}
function validState(s){
 const named=e=>e&&typeof e.id==='string'&&e.id.length<=200&&typeof e.title==='string'&&e.title.length>0&&e.title.length<=100;
 const range=e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start>=0&&e.end<=24&&e.end>e.start;
 if(!s||![1,2,3].includes(s.version)||!s.sleep||!validTime(s.sleep.bed)||!Number.isFinite(s.sleep.hours)||s.sleep.hours<4||s.sleep.hours>12)return false;
 if(!['tasks','fixed','social'].every(k=>Array.isArray(s[k])&&s[k].length<=100))return false;
 if(!s.tasks.every(t=>named(t)&&validDate(t.due)&&(!t.dueTime||validTime(t.dueTime))&&Number.isFinite(t.hours)&&t.hours>0&&t.hours<=300&&Number.isInteger(t.hours*2)&&(t.difficulty===undefined||[1,2,3].includes(t.difficulty))&&(t.duration===undefined||Number.isFinite(t.duration)&&t.duration>=0&&t.duration<=8)))return false;
 if(!s.fixed.every(e=>named(e)&&range(e)&&Array.isArray(e.days)&&e.days.length>0&&e.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&(e.intervalWeeks===undefined||Number.isInteger(e.intervalWeeks)&&e.intervalWeeks>=1&&e.intervalWeeks<=52)&&(e.startsOn===undefined||validDate(e.startsOn))&&(!(e.intervalWeeks>1)||validDate(e.startsOn))&&(e.exceptions===undefined||Array.isArray(e.exceptions)&&e.exceptions.length<=2000&&e.exceptions.every(validDate))))return false;
 if(!s.social.every(e=>named(e)&&range(e)&&validDate(e.date)))return false;
 if(s.preferences!==undefined&&(!s.preferences||typeof s.preferences.name!=='string'||s.preferences.name.length>40||!['green','blue','orange','violet','rose'].includes(s.preferences.theme)||(s.preferences.motion!==undefined&&typeof s.preferences.motion!=='boolean')))return false;
 const ids=[...s.tasks,...s.fixed,...s.social].map(e=>e.id);if(new Set(ids).size!==ids.length)return false;
 if(s.history!==undefined&&(!Array.isArray(s.history)||s.history.length>40000||!s.history.every(e=>named(e)&&range(e)&&validDate(e.date)&&e.type==='study')))return false;
 if(s.study!==undefined&&(!Array.isArray(s.study)||s.study.length>40000||!s.study.every(e=>named(e)&&range(e)&&validDate(e.date)&&e.type==='study')))return false;
 if(s.studyPrefs!==undefined&&!validStudyPrefs(s.studyPrefs))return false;
 for(const key of ['pins','skips'])if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].length>4000||!s[key].every(e=>named(e)&&range(e)&&validDate(e.date)&&typeof e.key==='string')))return false;
 if(s.progress!==undefined&&(!Array.isArray(s.progress)||s.progress.length>20000||!s.progress.every(e=>typeof e.key==='string'&&typeof e.taskId==='string'&&validDate(e.date)&&range(e)&&Number.isInteger(e.actualMinutes)&&e.actualMinutes>=0&&e.actualMinutes<=Math.round((e.end-e.start)*60)&&['done','partial','postponed'].includes(e.status)&&typeof e.recordedAt==='string')||new Set(s.progress.map(e=>e.key)).size!==s.progress.length))return false;
 if((s.progress||[]).some(e=>!s.tasks.some(t=>t.id===e.taskId)||isNaN(Date.parse(e.recordedAt)))||s.tasks.some(t=>completedMinutes(s,t.id)>Math.round(t.hours*60)))return false;
 return true;
}
function migrate(s){if(!validState(s))throw Error('La copia no es válida.');return {...s,version:3,tasks:s.tasks.map(t=>({...t,dueTime:t.dueTime||'09:00',duration:t.duration??1,difficulty:t.difficulty||2})),study:s.study||[],history:s.history||[],progress:s.progress||[],pins:s.pins||[],skips:s.skips||[],studyPrefs:s.studyPrefs||defaults(),tutorialDone:!!s.tutorialDone,preferences:s.preferences||{name:'',theme:'green'}}}
function completedMinutes(s,id){return (s.progress||[]).filter(p=>p.taskId===id).reduce((n,p)=>n+p.actualMinutes,0)}
function sessionKey(e){return e.key||`${e.id}@${e.date}@${Math.round(e.start*60)}`}
function recordProgress(s,e,status,actualMinutes,now=new Date()){
 const next=structuredClone(s),task=next.tasks.find(t=>t.id===e.id);if(!task)throw Error('No se encuentra el objetivo.');
 const duration=Math.round((e.end-e.start)*60),actual=status==='done'?duration:status==='postponed'?0:Number(actualMinutes);
 if(!['done','partial','postponed'].includes(status)||!Number.isInteger(actual)||actual<0||actual>duration)throw Error('Indica los minutos reales, entre 0 y '+duration+'.');
 const key=sessionKey(e);next.progress=next.progress.filter(p=>p.key!==key);
 if(completedMinutes(next,e.id)+actual>Math.round(task.hours*60))throw Error('El progreso superaría las horas totales del objetivo. Ajusta primero el objetivo.');
 next.progress.push({key,taskId:e.id,date:e.date,start:e.start,end:e.end,actualMinutes:actual,status,recordedAt:now.toISOString()});next.pins=next.pins.filter(p=>p.key!==key);return next;
}
function removeEntry(s,kind,id,date,scope='all'){
 const next=structuredClone(s);if(kind==='fixed'&&scope==='one'){const routine=next.fixed.find(e=>e.id===id);if(!routine||!validDate(date))throw Error('No se encuentra esa sesión.');routine.exceptions=[...new Set([...(routine.exceptions||[]),date])];}
 else {if(!['fixed','social','tasks'].includes(kind))throw Error('Tipo inválido.');next[kind]=next[kind].filter(e=>e.id!==id);if(kind==='fixed')next.social=next.social.filter(e=>e.sourceFixedId!==id);if(kind==='tasks'){next.study=next.study.filter(e=>e.id!==id);next.history=next.history.filter(e=>e.id!==id);next.progress=next.progress.filter(e=>e.taskId!==id);next.pins=next.pins.filter(e=>e.id!==id);next.skips=next.skips.filter(e=>e.id!==id);}}
 return next;
}
const api={iso,addDays,num,validDate,validTime,weekIndex,overlap,occursOn,recurringCoincides,sleepConflict,defaults,validStudyPrefs,validState,migrate,completedMinutes,sessionKey,recordProgress,removeEntry};if(typeof module!=='undefined')module.exports=api;else root.BrisaModel=api;
})(globalThis);
