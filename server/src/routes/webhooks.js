import {Router} from 'express';
import express from 'express';
import {verifyPayPalWebhook} from '../payments/paypal/webhookVerify.js';
import {WebhookEvent} from '../db/models.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {config} from '../config.js';
import {log} from '../lib/log.js';
const r=Router();
r.post('/paypal',express.raw({type:'*/*',limit:'1mb'}),asyncHandler(async(req,res)=>{
 let event;try{event=JSON.parse(req.body.toString('utf8'))}catch{return res.status(400).end()}
 const verification=await verifyPayPalWebhook({headers:req.headers,rawBody:req.body});
 const entry={eventId:event.id,eventType:event.event_type,resourceId:event.resource?.id??event.resource?.dispute_id??event.resource?.invoice?.id,verified:verification.ok,verifyReason:verification.reason,raw:event};
 if(!verification.ok){if(event.id)await WebhookEvent.create(entry).catch(()=>{});return res.status(400).json({error:'invalid signature'})}
 try{await WebhookEvent.create(entry)}catch(e){if(e.code===11000)return res.json({duplicate:true});throw e}
 res.status(200).json({received:true});setImmediate(async()=>{try{
  if(event.event_type==='INVOICING.INVOICE.PAID'){const {onInvoicePaid}=await import('../services/invoiceService.js');await onInvoicePaid(event.resource?.id??event.resource?.invoice?.id)}
  if(['CUSTOMER.DISPUTE.CREATED','CUSTOMER.DISPUTE.UPDATED','CUSTOMER.DISPUTE.RESOLVED'].includes(event.event_type)){const {onDisputeEvent}=await import('../services/disputeService.js');await onDisputeEvent(event.resource,event.event_type)}
  await WebhookEvent.updateOne({eventId:event.id},{$set:{processedAt:new Date()}});log.info('webhook.processed',{eventId:event.id,eventType:event.event_type})
 }catch(error){await WebhookEvent.updateOne({eventId:event.id},{$set:{error:error.message}});log.error('webhook.processing_failed',{eventId:event.id,message:error.message})}});
}));
r.get('/recent',asyncHandler(async(req,res)=>{if(req.query.token!==config.DEBUG_TOKEN)return res.sendStatus(403);res.json(await WebhookEvent.find().sort({receivedAt:-1}).limit(20).lean())}));
export default r;

