(function(root){
'use strict';
// These documents are drafts for Spain. They do not enable account creation.
const config={version:'0.7.0-borrador',publishedAt:'2026-11-15',country:'España',controller:'Gonzalo Gallego Gómez',contact:'gallegogonzalo2@gmail.com',status:'draft',registrationEnabled:false,termsVersion:'condiciones-0.7.0-borrador',privacyVersion:'privacidad-0.7.0-borrador',storageVersion:'almacenamiento-0.7.0-borrador'};
function reviewAcceptance(input){
 if(input?.termsAccepted!==true)return {ok:false,message:'Lee las condiciones y marca la casilla si estás de acuerdo. Puedes volver sin aceptarlas.'};
 return {ok:true,previewOnly:true,termsVersion:config.termsVersion,privacyNoticeVersion:config.privacyVersion,message:'Has completado la vista previa. No se ha creado una cuenta ni registrado una aceptación contractual. El registro sigue sin estar disponible.'};
}
const api={config:Object.freeze(config),reviewAcceptance};if(typeof module!=='undefined')module.exports=api;else root.BrisaLegal=api;
})(globalThis);
