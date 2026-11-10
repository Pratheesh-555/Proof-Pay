import {Evidence} from '../db/models.js';
import {canonicalJSON,sha256} from '../lib/canonical.js';
const id = (v) => v == null ? null : String(v);
function payload(e){return {projectId:id(e.projectId),milestoneId:id(e.milestoneId),kind:e.kind,trust:e.trust,source:e.source,title:e.title??null,summary:e.summary??null,data:e.data??null,url:e.url??null,file:e.file??null,capturedAt:new Date(e.capturedAt??Date.now()).toISOString(),seq:e.seq,prevHash:e.prevHash};}
const digest = (e) => sha256(canonicalJSON(payload(e)));
export async function appendEvidence(input){
 const last=await Evidence.findOne({projectId:input.projectId}).sort({seq:-1}).lean();
 const seq=(last?.seq??0)+1;const item={...input,seq,prevHash:last?.sha256??'GENESIS'};
 item.sha256=digest(item);return Evidence.create(item);
}
export async function verifyLedger(projectId){
 const items=await Evidence.find({projectId}).sort({seq:1}).lean();let prev='GENESIS';
 for(let i=0;i<items.length;i++){if(items[i].seq!==i+1||items[i].prevHash!==prev||digest(items[i])!==items[i].sha256)return {ok:false,head:prev};prev=items[i].sha256}
 return {ok:true,head:prev};
}

