(function(root){
'use strict';
class CloudSync {
 constructor({backend,validate,onLoad=()=>{},onStatus=()=>{},delay=1000}){Object.assign(this,{backend,validate,onLoad,onStatus,delay});this.generation=0;this.userId=null;this.revision=0;this.ready=false;this.dirty=null;this.inFlight=null;this.timer=null;this.conflict=false;}
 status(name,error=null){this.onStatus({name,error,userId:this.userId,revision:this.revision,dirty:!!this.dirty});}
 disconnect(){this.generation++;clearTimeout(this.timer);this.timer=null;this.userId=null;this.ready=false;this.revision=0;this.dirty=null;this.inFlight=null;this.conflict=false;}
 async connect(userId){this.disconnect();this.userId=userId;const generation=this.generation;this.status('loading');try{const row=await this.backend.load(userId);if(generation!==this.generation)return false;if(row&&(!this.validate(row.payload)||!Number.isSafeInteger(Number(row.revision))||Number(row.revision)<1))throw Error('BRISA_INVALID_CLOUD_DATA');this.revision=row?Number(row.revision):0;this.onLoad(row?.payload||null);this.ready=true;this.status('saved');return true;}catch(error){if(generation===this.generation)this.status('load-error',error);return false;}}
 queue(payload){if(!this.ready||!this.userId||!this.validate(payload))return false;this.dirty=structuredClone(payload);if(this.conflict){this.status('conflict');return false;}this.status('pending');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),this.delay);return true;}
 flush(){
  clearTimeout(this.timer);this.timer=null;
  if(this.inFlight)return this.inFlight;
  if(!this.ready||!this.userId||!this.dirty||this.conflict)return Promise.resolve(false);
  const snapshot=this.dirty,owner=this.userId,generation=this.generation,expected=this.revision;this.dirty=null;this.status('saving');
  const operation=(async()=>{let successful=false;try{const result=await Promise.resolve().then(()=>this.backend.save(owner,snapshot,expected));if(generation!==this.generation)return false;if(!Number.isSafeInteger(Number(result.revision))||Number(result.revision)!==expected+1)throw Error('BRISA_INVALID_REVISION');this.revision=Number(result.revision);successful=true;this.status(this.dirty?'pending':'saved');return true;}catch(error){if(generation!==this.generation)return false;this.dirty=this.dirty||snapshot;if(error.code==='40001'||String(error.message).includes('BRISA_CONFLICT')){this.conflict=true;this.status('conflict',error);}else this.status('save-error',error);return false;}finally{if(this.inFlight===operation)this.inFlight=null;if(successful&&generation===this.generation&&this.dirty&&!this.conflict){clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),this.delay);}}})();
  this.inFlight=operation;return operation;
 }
}
if(typeof module!=='undefined')module.exports={CloudSync};else root.BrisaCloud={CloudSync};
})(globalThis);
