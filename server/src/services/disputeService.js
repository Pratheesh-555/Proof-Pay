import { Case, Invoice, Milestone } from '../db/models.js';
import { getDispute, availableActions } from '../payments/paypal/disputes.js';
import { mapDispute } from './mapping.js';
import { analyseCase } from './caseService.js';
import { AppError } from '../lib/errors.js';

const cents = (money) => Math.round(Number(money?.value ?? 0) * 100);

function mirror(dispute) {
  return {
    status: dispute.status,
    stage: dispute.dispute_life_cycle_stage,
    reason: dispute.reason,
    disputeAmountCents: cents(dispute.dispute_amount),
    currency: dispute.dispute_amount?.currency_code ?? 'USD',
    sellerResponseDueDate: dispute.seller_response_due_date,
    allowedActions: availableActions(dispute),
    outcomeCode: dispute.dispute_outcome?.outcome_code,
    raw: dispute,
    refreshedAt: new Date(),
  };
}

export async function upsertDispute(dispute, { analyse = false, ownerId } = {}) {
  if (!dispute?.dispute_id) throw new AppError('INVALID_DISPUTE', 'PayPal dispute id is missing.', 400);
  let doc = await Case.findOne({ paypalDisputeId: dispute.dispute_id });
  const created = !doc;
  if (!doc) doc = new Case({ paypalDisputeId: dispute.dispute_id, ownerId, status: 'NEW' });
  if (ownerId && !doc.ownerId) doc.ownerId = ownerId;
  doc.paypal = mirror(dispute);
  const mapped = await mapDispute(dispute);
  if (mapped.invoice) {
    doc.invoiceId = mapped.invoice._id;
    doc.projectId = mapped.invoice.projectId;
    doc.milestoneId = mapped.invoice.milestoneId;
    doc.mapping = { method: mapped.method, confidence: mapped.confidence };
    if (doc.status === 'NEW' || doc.status === 'UNMAPPED') doc.status = 'ANALYSING';
    const milestone = await Milestone.findById(doc.milestoneId);
    if (milestone && ['PAID', 'INVOICED'].includes(milestone.status)) { milestone.status = 'DISPUTED'; await milestone.save(); }
  } else if (!doc.milestoneId) doc.status = 'UNMAPPED';
  doc.timeline.push({ type: created ? 'DISPUTE_CREATED' : 'DISPUTE_REFRESHED', detail: `${dispute.status ?? 'unknown'}; actions: ${doc.paypal.allowedActions.join(', ')}` });
  await doc.save();
  if (analyse && doc.milestoneId && ['ANALYSING', 'NEW'].includes(doc.status)) await analyseCase(doc._id);
  return doc;
}

export async function onDisputeEvent(resource, eventType) {
  const id = resource?.dispute_id ?? resource?.id;
  if (!id) throw new AppError('INVALID_WEBHOOK', 'Dispute webhook has no dispute id.', 400);
  const dispute = await getDispute(id);
  const doc = await upsertDispute(dispute, { analyse: eventType === 'CUSTOMER.DISPUTE.CREATED' });
  if (eventType === 'CUSTOMER.DISPUTE.RESOLVED' || dispute.status === 'RESOLVED') {
    doc.status = 'RESOLVED';
    doc.outcome = { result: dispute.dispute_outcome?.outcome_code ?? 'UNKNOWN', at: new Date(), moneyProtectedCents: dispute.dispute_outcome?.outcome_code?.includes('SELLER') ? doc.paypal.disputeAmountCents : 0 };
    await doc.save();
    if (doc.milestoneId) await Milestone.findByIdAndUpdate(doc.milestoneId, { status: 'RESOLVED' });
  }
  return doc;
}
