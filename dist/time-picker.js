'use strict';
(function(){
 const $=id=>document.getElementById(id);let target=null,hour=9;
 const pad=n=>String(n).padStart(2,'0');
 function draw(){
  const minute=Number($('pickerMinute').value),safe=Number.isInteger(minute)&&minute>=0&&minute<=59;
  $('timePreview').textContent=pad(hour)+':'+(safe?pad(minute):'––');
  $('pickerHours').innerHTML=Array.from({length:24},(_,h)=>`<button type="button" data-hour="${h}" aria-pressed="${h===hour}" aria-label="${pad(h)} horas">${pad(h)}</button>`).join('');
  document.querySelectorAll('[data-minute]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.minute)===minute)));
 }
 function close(){ $('timePicker').close();if(target)target.focus(); }
 document.querySelectorAll('[data-time-target]').forEach(button=>{
  button.onclick=()=>{const input=$(button.dataset.timeTarget);if(input.disabled)return;target=input;const value=Planner.validTime(input.value)?input.value:'09:00';hour=Number(value.slice(0,2));$('pickerMinute').value=Number(value.slice(3));$('pickerError').textContent='';draw();$('timePicker').showModal();};
 });
 $('pickerHours').onclick=e=>{const b=e.target.closest('[data-hour]');if(!b)return;hour=Number(b.dataset.hour);draw();const selected=$('pickerHours').querySelector(`[data-hour="${hour}"]`);selected?.focus()};
 $('pickerQuickMinutes').onclick=e=>{const b=e.target.closest('[data-minute]');if(!b)return;$('pickerMinute').value=Number(b.dataset.minute);draw()};
 $('pickerMinute').oninput=draw;$('closeTimePicker').onclick=close;
 $('timePicker').oncancel=e=>{e.preventDefault();close()};
 $('timePickerForm').onsubmit=e=>{e.preventDefault();const minute=Number($('pickerMinute').value);if($('pickerMinute').value===''||!Number.isInteger(minute)||minute<0||minute>59){$('pickerError').textContent='Elige un minuto entre 00 y 59.';return}if(target){target.value=pad(hour)+':'+pad(minute);target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));}close();};
})();
