'use strict';
(function(){
 const print=document.getElementById('printLegal');if(print)print.onclick=()=>window.print();
 const form=document.getElementById('legalReviewForm');if(!form)return;
 const box=document.getElementById('acceptTerms'),button=document.getElementById('reviewContinue'),status=document.getElementById('legalReviewStatus');
 box.checked=false;button.disabled=true;
 box.onchange=()=>{button.disabled=!box.checked;status.textContent=''};
 form.onsubmit=e=>{e.preventDefault();const result=BrisaLegal.reviewAcceptance({termsAccepted:box.checked});status.textContent=result.message;status.focus()};
})();
