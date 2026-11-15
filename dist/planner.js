(function(root){
function plan(state,start,days=7){
 const events=[],pending=[];const bedtime=Number(state.sleep.bed.split(':')[0])+Number(state.sleep.bed.split(':')[1])/60;
 const wake=(bedtime+state.sleep.hours)%24;
 const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
 for(let i=0;i<days;i++){let date=new Date(start+'T12:00:00');date.setDate(date.getDate()+i);let day=iso(date),dow=date.getDay();
 state.fixed.filter(e=>e.days.includes(dow)).forEach(e=>events.push({...e,date:day,type:'fixed'}));
 state.social.filter(e=>e.date===day).forEach(e=>events.push({...e,type:'social'}));
 }
 const now=new Date(), earliest=iso(now), hourNow=now.getHours()+now.getMinutes()/60;
 const tasks=[...state.tasks].sort((a,b)=>a.due.localeCompare(b.due));
 for(const t of tasks){let left=Math.round(t.hours*2);let daily={};let candidates=[];
 for(let i=0;i<days;i++){let date=new Date(start+'T12:00:00');date.setDate(date.getDate()+i);let day=iso(date);if(day>=t.due||day<earliest)continue;
 for(let h=Math.max(8,wake);h+0.5<=Math.min(22,bedtime<=12?24:bedtime);h+=0.5)if(day!==earliest||h>=hourNow)candidates.push({date:day,start:h,end:h+0.5});}
 while(left>0){let free=candidates.filter(c=>(daily[c.date]||0)<6&&!events.some(e=>e.date===c.date&&e.start<c.end&&e.end>c.start));free.sort((a,b)=>(daily[a.date]||0)-(daily[b.date]||0)||a.date.localeCompare(b.date)||a.start-b.start);if(!free.length)break;let c=free[0];events.push({...c,id:t.id,title:t.title,type:'study'});daily[c.date]=(daily[c.date]||0)+1;left--;}
 if(left)pending.push({title:t.title,hours:left/2});
 }
 const merged=[];events.sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start).forEach(e=>{let p=merged.at(-1);if(p&&p.id===e.id&&p.date===e.date&&p.end===e.start&&e.type==='study')p.end=e.end;else merged.push({...e});});
 return {events:merged,pending,studyHours:events.filter(e=>e.type==='study').reduce((n,e)=>n+e.end-e.start,0)};
}
if(typeof module!=='undefined')module.exports={plan};else root.Planner={plan};
})(globalThis);
