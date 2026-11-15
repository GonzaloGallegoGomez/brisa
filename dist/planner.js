(function(root){
'use strict';
const M=typeof module!=='undefined'?require('./model.js'):root.BrisaModel;
const {iso,addDays,num,occursOn,sleepConflict,overlap}=M;
function plan(state,viewStart,days=7,now=new Date()){
 const today=iso(now),hourNow=now.getHours()+now.getMinutes()/60,p={...M.defaults(),...state.studyPrefs};
 const tasks=[...state.tasks].sort((a,b)=>a.due.localeCompare(b.due)||(b.difficulty||2)-(a.difficulty||2)||a.id.localeCompare(b.id));
 const exams=tasks.map(t=>({id:t.id,key:'exam-'+t.id,title:t.title,date:t.due,start:num(t.dueTime||'09:00'),end:Math.min(24,num(t.dueTime||'09:00')+(t.duration??1)),type:'exam'}));
 const allStudy=[],pending=[],invalidPins=[],occupied=new Map(),sessionsByDate=new Map(),daily=new Map(),targetDaily=new Map();
 const breakHours=p.breakMinutes/60,bufferHours=p.bufferMinutes/60;
 const progress=state.progress||[],skips=state.skips||[],allPast=[...new Map([...(state.history||[]),...(state.study||[])].map(e=>[M.sessionKey(e),e])).values()].filter(e=>e.date<today||e.date===today&&e.start<hourNow).filter(e=>!progress.some(r=>r.key===M.sessionKey(e)));
 const busy=date=>{if(!occupied.has(date)){
 const list=[...state.fixed.filter(e=>occursOn(e,date)),...state.social.filter(e=>e.date===date),...exams.filter(e=>e.date===date)].map(e=>({...e,start:Math.max(0,e.start-bufferHours),end:Math.min(24,e.end+bufferHours)}));
 if(p.lunchEnabled)list.push({start:num(p.lunchStart),end:num(p.lunchEnd)});
 list.push(...skips.filter(e=>e.date===date),...progress.filter(e=>e.date===date),...allPast.filter(e=>e.date===date));occupied.set(date,list)}return occupied.get(date)};
 const remaining=new Map(tasks.map(t=>[t.id,Math.max(0,Math.round(t.hours*60)-M.completedMinutes(state,t.id))]));
 const usedKey=new Set();
 function fits(e){if(e.date<today||e.date===today&&e.start<hourNow||p.daysOff.includes(new Date(e.date+'T12:00:00').getDay()))return false;
 const bed=num(state.sleep.bed),effectiveEnd=Math.min(num(p.end),bed>12?bed:24)-p.reserveMinutes/60;
 if(e.start<num(p.start)||e.end>effectiveEnd+1e-6||sleepConflict(state.sleep,e.start,e.end)||busy(e.date).some(b=>!(e.sourceKey&&b.key===e.sourceKey)&&overlap(e,b)))return false;
 if((sessionsByDate.get(e.date)||[]).some(b=>overlap(e,b,breakHours)))return false;
 const minutes=Math.round((e.end-e.start)*60);return (daily.get(e.date)||0)+minutes<=p.maxDailyHours*60&&(targetDaily.get(e.id+'@'+e.date)||0)+minutes<=p.maxTaskDailyHours*60;
 }
 function add(e){allStudy.push(e);if(!sessionsByDate.has(e.date))sessionsByDate.set(e.date,[]);sessionsByDate.get(e.date).push(e);const n=Math.round((e.end-e.start)*60);daily.set(e.date,(daily.get(e.date)||0)+n);targetDaily.set(e.id+'@'+e.date,(targetDaily.get(e.id+'@'+e.date)||0)+n);remaining.set(e.id,remaining.get(e.id)-n);}
 for(const pin of (state.pins||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start)){
 const task=tasks.find(t=>t.id===pin.id);if(!task||progress.some(r=>r.key===pin.key)||pin.date<today||pin.date===today&&pin.start<hourNow)continue;
 const e={...pin,title:task.title,type:'study',pinned:true};if(e.date>=task.due||Math.round((e.end-e.start)*60)>remaining.get(e.id)||!fits(e))invalidPins.push(e);else{add(e);usedKey.add(e.key);}
 }
 for(const t of tasks){let left=remaining.get(t.id);const availableDates=[];
 for(let d=today,i=0;d<t.due&&i<366;d=addDays(d,1),i++)if(!p.daysOff.includes(new Date(d+'T12:00:00').getDay()))availableDates.push(d);
 while(left>0){let best=null;
  for(const date of availableDates){const perTask=targetDaily.get(t.id+'@'+date)||0;if(perTask>=p.maxTaskDailyHours*60||(daily.get(date)||0)>=p.maxDailyHours*60)continue;
   let length=Math.min(p.sessionMinutes,left,p.maxTaskDailyHours*60-perTask,p.maxDailyHours*60-(daily.get(date)||0));length=length>=30?Math.floor(length/30)*30:Math.floor(length);
   for(let duration=length;duration>0;duration=duration>30?duration-30:0){let dateBest=null;
    for(let m=Math.ceil(num(p.start)*60/15)*15;m+duration<=num(p.end)*60;m+=15){const e={id:t.id,title:t.title,date,start:m/60,end:(m+duration)/60,type:'study'};e.key=M.sessionKey(e);if(usedKey.has(e.key)||!fits(e))continue;
     const preferred=p.preferredPeriod==='any'||p.preferredPeriod==='morning'&&e.start<12||p.preferredPeriod==='afternoon'&&e.start>=12&&e.start<18||p.preferredPeriod==='evening'&&e.start>=18;
     const score=[perTask,daily.get(date)||0,preferred?0:1,date,m];if(!dateBest||compare(score,dateBest.score)<0)dateBest={event:e,score};
    }
    if(dateBest){if(!best||compare(dateBest.score,best.score)<0)best=dateBest;break;}
   }
  }
  if(!best)break;add(best.event);usedKey.add(best.event.key);left=remaining.get(t.id);
 }
 if(left>0)pending.push({id:t.id,title:t.title,hours:left/60});
 }
 const events=[],end=addDays(viewStart,days);
 for(let i=0;i<days;i++){const date=addDays(viewStart,i);state.fixed.filter(e=>occursOn(e,date)).forEach(e=>events.push({...e,date,type:'fixed',key:e.id+'@'+date}));state.social.filter(e=>e.date===date).forEach(e=>events.push({...e,type:'social',key:e.id}));if(p.lunchEnabled)events.push({id:'lunch',key:'lunch@'+date,title:'Comida · tiempo para ti',date,start:num(p.lunchStart),end:num(p.lunchEnd),type:'rest'});}
 events.push(...exams.filter(e=>e.date>=viewStart&&e.date<end),...allStudy.filter(e=>e.date>=viewStart&&e.date<end));
 const breaks=allStudy.filter(e=>e.date>=viewStart&&e.date<end&&p.breakMinutes>0).map(e=>({id:'break-'+e.key,key:'break-'+e.key,title:'Pausa para respirar',date:e.date,start:e.end,end:Math.min(24,e.end+breakHours),type:'break'}));events.push(...breaks);
 progress.filter(e=>e.status!=='postponed'&&e.date>=viewStart&&e.date<end&&tasks.some(t=>t.id===e.taskId)).forEach(e=>events.push({id:e.taskId,key:e.key,title:tasks.find(t=>t.id===e.taskId).title,date:e.date,start:e.start,end:e.end,type:'done',actualMinutes:e.actualMinutes,status:e.status}));
 events.sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start);
 return {events,allStudy,pending,invalidPins,unreviewed:allPast.filter(e=>tasks.some(t=>t.id===e.id)),studyHours:events.filter(e=>e.type==='study').reduce((n,e)=>n+e.end-e.start,0),totalStudyHours:allStudy.reduce((n,e)=>n+e.end-e.start,0),completedHours:progress.reduce((n,e)=>n+e.actualMinutes,0)/60};
}
function compare(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]<b[i]?-1:1;return 0}
function changes(before,after){const a=new Map(before.allStudy.map(e=>[M.sessionKey(e),e])),b=new Map(after.allStudy.map(e=>[M.sessionKey(e),e]));return {removed:[...a].filter(([k,e])=>!b.has(k)||b.get(k).end!==e.end).map(([,e])=>e),added:[...b].filter(([k,e])=>!a.has(k)||a.get(k).end!==e.end).map(([,e])=>e)}}
const api={...M,plan,changes};if(typeof module!=='undefined')module.exports=api;else root.Planner=api;
})(globalThis);
