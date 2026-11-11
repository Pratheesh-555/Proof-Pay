import test from 'node:test';
import assert from 'node:assert/strict';
import {dollarsToCents,centsToDollars} from '../src/lib/money.js';
import {applyPolicy} from '../src/ai/policy.js';
import {checkClaims,composeNote} from '../src/ai/verifierRules.js';
import {availableActions} from '../src/payments/paypal/disputes.js';
import {assertApproved,submissionHash} from '../src/services/gate.js';
import {Case} from '../src/db/models.js';

test('money conversion uses integer cents and rejects invalid precision',()=>{
 assert.equal(dollarsToCents('25.01'),2501);assert.equal(centsToDollars(2501),'25.01');assert.throws(()=>dollarsToCents('1.999'));
});
test('policy clamps partial refunds to the project cap',()=>{
 const out=applyPolicy({recommendation:{action:'PARTIAL_REFUND',refundPct:80},assessment:{overall:{done:'PARTIAL'}},evidence:[],disputeAmountCents:10000,capPct:30,allowedActions:['accept_claim']});
 assert.equal(out.action,'PARTIAL_REFUND');assert.equal(out.refundCents,3000);
});
test('policy refuses an unsupported fight recommendation',()=>{
 const out=applyPolicy({recommendation:{action:'FIGHT'},assessment:{overall:{done:'YES'}},evidence:[],disputeAmountCents:10000,capPct:30,allowedActions:['provide_evidence']});assert.equal(out.action,'ACCEPT');
});
test('policy allows supporting information during the chargeback stage',()=>{
 const out=applyPolicy({recommendation:{action:'FIGHT'},assessment:{overall:{done:'PARTIAL'}},evidence:[{trust:'VERIFIED',kind:'CLIENT_APPROVAL'}],disputeAmountCents:500,capPct:30,allowedActions:['provide_supporting_info']});assert.equal(out.action,'FIGHT');assert.equal(out.paypalAllowsNow,true);
});
test('verifier removes uncited and unknown-evidence claims',()=>{
 const result=checkClaims([{text:'No citation'},{text:'Cites absent evidence',evidenceIds:['E9']},{text:'Release published',evidenceIds:['E1']}],[{ref:'E1',trust:'VERIFIED'}]);
 assert.equal(result.kept.length,1);assert.equal(result.removed.length,2);
});
test('verifier rejects client claims supported only by seller notes',()=>{
 const result=checkClaims([{text:'The client approved the work',evidenceIds:['E1']}],[{ref:'E1',trust:'CLAIMED'}]);assert.equal(result.kept.length,0);
});
test('note composer includes evidence references and legend',()=>{
 const note=composeNote({claims:[{text:'Release was published.',evidenceIds:['E1']}],closing:'Please review.',evidence:[{ref:'E1',title:'Release v1.0'}]});assert.match(note,/E1/);assert.match(note,/Release v1\.0/);
});
test('PayPal actions come only from normalized HATEOAS links',()=>{
 assert.deepEqual(availableActions({links:[{rel:'self'},{rel:'provide-evidence'},{rel:'adjudicate'}]}),['provide_evidence','adjudicate']);
});
test('approval gate detects a changed draft hash',()=>{
 const draft={claims:[{text:'Supported claim',evidenceIds:['E1']}],closing:'Review.'};
 const doc={status:'APPROVED',approval:{draftHash:submissionHash({ai:{draft}})},ai:{draft}};
 assert.doesNotThrow(()=>assertApproved(doc));
 doc.ai.draft.closing='Changed after approval';
 assert.throws(()=>assertApproved(doc),/Approve the current draft/);
});
test('case timeline stores event objects',()=>{
 const doc=new Case({paypalDisputeId:'PP-R-TEST-001',timeline:[{eventType:'DISPUTE_CREATED',detail:'UNDER_REVIEW'}]});
 assert.equal(doc.validateSync(),undefined);assert.equal(doc.timeline[0].eventType,'DISPUTE_CREATED');
});
