import { Case, Evidence, Milestone, Project } from '../db/models.js';
import { analyseCase as runAnalysis } from '../ai/orchestrator.js';
import { availableActions, getDispute, provideEvidence, provideSupportingInfo, makeOffer, acceptClaim } from '../payments/paypal/disputes.js';
import { assertApproved, submissionHash } from './gate.js';
import { AppError, notFound } from '../lib/errors.js';

async function load(id) { const doc = await Case.findById(id); if (!doc) throw notFound('Case not found.'); return doc; }

async function context(doc) {
  const milestone = await Milestone.findById(doc.milestoneId).lean();
  const project = await Project.findById(doc.projectId).lean();
  const evidence = await Evidence.find({ milestoneId: doc.milestoneId }).sort({ capturedAt: 1, _id: 1 }).lean();
  const refs = evidence.map((item, index) => ({ ref: `E${index + 1}`, ...item }));
  return { milestone, project, evidence: refs };
}

export async function analyseCase(id) {
  const doc = await load(id);
  if (!doc.milestoneId) throw new AppError('UNMAPPED_CASE', 'Map the dispute to a milestone first.', 409);
  doc.status = 'ANALYSING'; await doc.save();
  const ctx = await context(doc);
  try {
    const result = await runAnalysis({ dispute: doc.paypal.raw, milestone: ctx.milestone, evidence: ctx.evidence, disputeAmountCents: doc.paypal.disputeAmountCents, capPct: ctx.project?.refundCapPct ?? 30, allowedActions: doc.paypal.allowedActions ?? [] });
    doc.evidenceRefs = ctx.evidence.map((item) => ({ ref: item.ref, evidenceId: item._id }));
    doc.ai = { assessment: result.assessment, strategy: result.strategy, draft: result.draft, removed: result.removed, runs: result.runs, error: result.ok ? undefined : result.error, ranAt: new Date() };
    if (result.ok) { doc.decision = { action: result.decision.action, refundCents: result.decision.refundCents, reasons: result.decision.reasons, editedByHuman: false }; doc.finalNote = result.finalNote; doc.citedEvidenceIds = result.citedEvidenceIds; }
    doc.status = 'READY'; await doc.save(); return doc;
  } catch (error) {
    doc.ai = { ...(doc.ai?.toObject?.() ?? doc.ai), error: error.message, ranAt: new Date() }; doc.status = 'READY'; await doc.save(); return doc;
  }
}

export async function editDraft(id, changes) {
  const doc = await load(id);
  if (!['READY', 'APPROVED'].includes(doc.status)) throw new AppError('INVALID_STATE', 'Only a ready case draft can be edited.', 409);
  if (!doc.decision) doc.decision = { action: 'FIGHT', refundCents: 0, reasons: [], editedByHuman: true };
  if (changes.finalNote !== undefined) doc.finalNote = changes.finalNote;
  if (changes.action !== undefined) doc.decision.action = changes.action;
  if (changes.refundCents !== undefined) doc.decision.refundCents = changes.refundCents;
  doc.decision.editedByHuman = true; doc.approval = undefined; doc.status = 'READY'; await doc.save(); return doc;
}

export async function approveCase(id, actor) {
  const doc = await load(id); if (doc.status !== 'READY') throw new AppError('INVALID_STATE', 'Only a ready case can be approved.', 409);
  if (!doc.decision?.action || !doc.finalNote?.trim()) throw new AppError('INCOMPLETE_DRAFT', 'Choose an action and write the response note before approving.', 409);
  if (doc.decision.action === 'PARTIAL_REFUND') {
    const milestone = await Milestone.findById(doc.milestoneId).populate('projectId');
    const capCents = Math.floor(doc.paypal.disputeAmountCents * ((milestone?.projectId?.refundCapPct ?? 30) / 100));
    if (!Number.isInteger(doc.decision.refundCents) || doc.decision.refundCents <= 0 || doc.decision.refundCents > capCents) {
      throw new AppError('REFUND_CAP', 'The partial refund must be positive and within the project refund cap.', 409, { capCents });
    }
  }
  doc.approval = { approvedAt: new Date(), approvedBy: actor, draftHash: submissionHash(doc) }; doc.status = 'APPROVED'; await doc.save(); return doc;
}

export async function mapCase(id, milestoneId, actor) {
  const doc = await load(id);
  const milestone = await Milestone.findById(milestoneId).populate('projectId');
  if (!milestone || String(milestone.projectId.ownerId) !== String(actor)) throw notFound('Milestone not found.');
  doc.milestoneId = milestone._id; doc.projectId = milestone.projectId._id;
  doc.mapping = { method: 'MANUAL', confidence: 'HIGH', confirmedBy: actor }; doc.status = 'ANALYSING';
  await doc.save(); return doc;
}

export async function submitCase(id) {
  const doc = await load(id); assertApproved(doc);
  const actions = doc.paypal.allowedActions ?? [];
  const action = doc.decision?.action;
  let result;
  if (doc.isReplay) { result = { replay: true, requestSummary: `Replay only: ${action}` }; }
  else if (action === 'FIGHT' && actions.includes('provide_supporting_info')) result = await provideSupportingInfo(doc.paypal.raw.dispute_id, { notes: doc.finalNote });
  else if (action === 'FIGHT' && actions.includes('provide_evidence')) result = await provideEvidence(doc.paypal.raw.dispute_id, { evidenceType: 'OTHER', notes: doc.finalNote });
  else if (action === 'PARTIAL_REFUND' && actions.includes('make_offer')) result = await makeOffer(doc.paypal.raw.dispute_id, { value: (doc.decision.refundCents / 100).toFixed(2), note: doc.finalNote });
  else if (action === 'PARTIAL_REFUND' && actions.includes('accept_claim')) result = await acceptClaim(doc.paypal.raw.dispute_id, { type: 'PARTIAL_REFUND', value: (doc.decision.refundCents / 100).toFixed(2), note: doc.finalNote });
  else if (action === 'ACCEPT' && actions.includes('accept_claim')) result = await acceptClaim(doc.paypal.raw.dispute_id, { note: doc.finalNote });
  else throw new AppError('NOT_ALLOWED_NOW', 'PayPal does not currently allow the selected action.', 409, { allowedActions: actions });
  doc.submissions.push({ at: new Date(), action, ok: true, httpStatus: 200, requestSummary: doc.isReplay ? result.requestSummary : 'PayPal dispute action submitted.' });
  doc.status = 'WAITING_PAYPAL'; doc.timeline.push({ type: 'SUBMITTED', detail: result.requestSummary ?? action }); await doc.save(); return doc;
}

export async function refreshCase(id) { const doc = await load(id); if (doc.isReplay) return doc; const remote = await getDispute(doc.paypal.raw.dispute_id); doc.paypal = { ...doc.paypal.toObject(), status: remote.status, stage: remote.dispute_life_cycle_stage, allowedActions: availableActions(remote), raw: remote, refreshedAt: new Date() }; await doc.save(); return doc; }

export { load as getCase };
