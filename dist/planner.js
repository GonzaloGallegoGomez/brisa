(function(root){
'use strict';
const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const num=s=>Number(s.split(':')[0])+Number(s.split(':')[1])/60;
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00'))&&iso(new Date(s+'T12:00:00'))===s;
const validTime=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const overlap=(a,b)=>a.start<b.end&&a.end>b.start;
// Calendar weeks are indexed in UTC to avoid daylight-saving offsets.
const weekIndex=date=>Math.floor((Date.parse(date+'T00:00:00Z')/86400000+3)/7);
function occursOn(event,date){
 if(!event.days.includes(new Date(date+'T12:00:00').getDay()))return false;
 if(event.startsOn&&date<event.startsOn)return false;
 return ((weekIndex(date)-weekIndex(event.startsOn||'1970-01-05'))%(event.intervalWeeks||1))===0;
}
function recurringCoincides(a,b){
 if(!a.days.some(d=>b.days.includes(d)))return false;
 const gcd=(x,y)=>y?gcd(y,x%y):x;
 // Infinite recurrences intersect exactly when their week phases agree modulo gcd.
 return (weekIndex(a.startsOn||'1970-01-05')-weekIndex(b.startsOn||'1970-01-05'))%gcd(a.intervalWeeks||1,b.intervalWeeks||1)===0;
}
function sleepConflict(sleep,start,end){const bed=num(sleep.bed),wake=(bed+sleep.hours)%24;return bed>wake?end>bed||start<wake:start<wake&&end>bed}
function validState(s){
 const named=e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&e.title.length>0&&e.title.length<=100;
 const range=e=>Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start>=0&&e.end<=24&&e.end>e.start;
 if(!s||![1,2].includes(s.version)||!s.sleep||!validTime(s.sleep.bed)||!Number.isFinite(s.sleep.hours)||s.sleep.hours<4||s.sleep.hours>12)return false;
 if(!['tasks','fixed','social'].every(k=>Array.isArray(s[k])&&s[k].length<=100))return false;
 if(!s.tasks.every(t=>named(t)&&validDate(t.due)&&(!t.dueTime||validTime(t.dueTime))&&Number.isFinite(t.hours)&&t.hours>0&&t.hours<=300&&Number.isInteger(t.hours*2)&&(t.duration===undefined||(Number.isFinite(t.duration)&&t.duration>=0&&t.duration<=8))))return false;
 if(!s.fixed.every(e=>named(e)&&range(e)&&Array.isArray(e.days)&&e.days.length>0&&e.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&(e.intervalWeeks===undefined||Number.isInteger(e.intervalWeeks)&&e.intervalWeeks>=1&&e.intervalWeeks<=52)&&(e.startsOn===undefined||validDate(e.startsOn))&&(!(e.intervalWeeks>1)||validDate(e.startsOn))))return false;
 if(!s.social.every(e=>named(e)&&range(e)&&validDate(e.date)))return false;
 if(s.preferences!==undefined&&(!s.preferences||typeof s.preferences.name!=='string'||s.preferences.name.length>40||!['green','blue','orange','violet','rose'].includes(s.preferences.theme)))return false;
 const ids=[...s.tasks,...s.fixed,...s.social].map(e=>e.id);if(new Set(ids).size!==ids.length)return false;
 if(s.study!==undefined&&(!Array.isArray(s.study)||s.study.length>40000||!s.study.every(e=>named(e)&&range(e)&&validDate(e.date)&&e.type==='study')))return false;
 return true;
}
function plan(state,viewStart,days=7,now=new Date()){
 const today=iso(now),hourNow=now.getHours()+now.getMinutes()/60;
 const viewEnd=addDays(viewStart,days),events=[],pending=[],allStudy=[];
 const tasks=[...state.tasks].sort((a,b)=>a.due.localeCompare(b.due)||(a.dueTime||'09:00').localeCompare(b.dueTime||'09:00')||a.id.localeCompare(b.id));
 const examEvents=tasks.map(t=>({id:'exam-'+t.id,title:t.title,date:t.due,start:num(t.dueTime||'09:00'),end:Math.min(24,num(t.dueTime||'09:00')+(t.duration??1)),type:'exam'}));
 const occupied=new Map(),totalDaily=new Map();
 const busy=date=>{if(!occupied.has(date)){const dow=new Date(date+'T12:00:00').getDay();occupied.set(date,[...state.fixed.filter(e=>occursOn(e,date)),...state.social.filter(e=>e.date===date),...examEvents.filter(e=>e.date===date)])}return occupied.get(date)};
 // Retain sessions already started; changing future plans never rewrites the past.
 for(const t of tasks){let budget=Math.round(t.hours*2);for(const e of (state.study||[]).filter(e=>e.id===t.id&&(e.date<today||(e.date===today&&e.start<hourNow))).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start)){if(budget<=0)break;const size=Math.min(budget,Math.round((e.end-e.start)*2));if(size<=0)continue;const kept={...e,title:t.title,end:e.start+size/2};allStudy.push(kept);busy(e.date).push(kept);totalDaily.set(e.date,(totalDaily.get(e.date)||0)+size);budget-=size;}}
 for(const t of tasks){const kept=allStudy.filter(e=>e.id===t.id);let left=Math.round(t.hours*2-kept.reduce((n,e)=>n+(e.end-e.start)*2,0));const daily=new Map();kept.forEach(e=>daily.set(e.date,(daily.get(e.date)||0)+(e.end-e.start)*2));const slots=[];
 // One continuous horizon, independent of the week currently on screen.
 for(let date=today,i=0;date<t.due&&i<366;date=addDays(date,1),i++){
  for(let h=8;h+0.5<=22;h+=0.5){const c={date,start:h,end:h+0.5};if(date===today&&h<hourNow)continue;if(sleepConflict(state.sleep,c.start,c.end)||busy(date).some(e=>overlap(c,e)))continue;slots.push(c);}
 }
 while(left>0){let best=null;for(const c of slots){if(c.used||(daily.get(c.date)||0)>=6||(totalDaily.get(c.date)||0)>=12||busy(c.date).some(e=>overlap(c,e)))continue;const score=[daily.get(c.date)||0,totalDaily.get(c.date)||0,c.date,c.start];if(!best||score[0]<best.score[0]||score[0]===best.score[0]&&(score[1]<best.score[1]||score[1]===best.score[1]&&(score[2]<best.score[2]||score[2]===best.score[2]&&score[3]<best.score[3])))best={slot:c,score};}if(!best)break;const c=best.slot;c.used=true;const e={id:t.id,title:t.title,date:c.date,start:c.start,end:c.end,type:'study'};allStudy.push(e);busy(c.date).push(e);daily.set(c.date,(daily.get(c.date)||0)+1);totalDaily.set(c.date,(totalDaily.get(c.date)||0)+1);left--;}
 if(left>0)pending.push({id:t.id,title:t.title,hours:left/2});
 }
 const merged=[];allStudy.sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start).forEach(e=>{const p=merged.at(-1);if(p&&p.id===e.id&&p.date===e.date&&p.end===e.start)p.end=e.end;else merged.push({...e})});
 for(let i=0;i<days;i++){const date=addDays(viewStart,i),dow=new Date(date+'T12:00:00').getDay();state.fixed.filter(e=>occursOn(e,date)).forEach(e=>events.push({...e,date,type:'fixed'}));state.social.filter(e=>e.date===date).forEach(e=>events.push({...e,type:'social'}));}
 events.push(...examEvents.filter(e=>e.date>=viewStart&&e.date<viewEnd),...merged.filter(e=>e.date>=viewStart&&e.date<viewEnd));events.sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start);
 return {events,pending,allStudy:merged,studyHours:events.filter(e=>e.type==='study').reduce((n,e)=>n+e.end-e.start,0),totalStudyHours:merged.reduce((n,e)=>n+e.end-e.start,0)};
}
const api={occursOn,recurringCoincides,weekIndex,plan,validState,validDate,validTime,sleepConflict,iso,addDays,num};if(typeof module!=='undefined')module.exports=api;else root.Planner=api;
})(globalThis);
