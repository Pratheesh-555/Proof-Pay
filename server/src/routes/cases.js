import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Case, Project } from '../db/models.js';
import { analyseCase, approveCase, editDraft, getCase, mapCase, refreshCase, submitCase } from '../services/caseService.js';
import { getDispute, requireEvidence, adjudicate, escalate } from '../payments/paypal/disputes.js';
import { upsertDispute } from '../services/disputeService.js';
import { AppError } from '../lib/errors.js';

const r = Router(); r.use(requireAuth);
async function requireOwnedCase(req, _res, next) {
 try {
  const projectIds = await Project.find({ ownerId: req.user.sub }).distinct('_id');
  const doc = await Case.findOne({ _id: req.params.id, $or: [{ ownerId: req.user.sub }, { projectId: { $in: projectIds } }] });
  if (!doc) throw new AppError('NOT_FOUND', 'Case not found.', 404);
  req.caseDoc = doc;
  next();
 } catch (error) { next(error); }
}
r.get('/cases', asyncHandler(async (req, res) => {
 const projectIds = await Project.find({ ownerId: req.user.sub }).distinct('_id');
 const cases = await Case.find({ $or: [{ ownerId: req.user.sub }, { projectId: { $in: projectIds } }] }).populate('projectId', 'title').populate('milestoneId', 'title').sort({ createdAt: -1 }).lean();
 res.json({ cases });
}));
r.post('/cases/import', validate(z.object({ disputeId: z.string().min(5).max(100) })), asyncHandler(async (req, res) => {
 const dispute = await getDispute(req.body.disputeId);
 const doc = await upsertDispute(dispute, { ownerId: req.user.sub });
 res.status(201).json({ case: doc });
}));
r.get('/cases/:id', requireOwnedCase, asyncHandler(async (req, res) => res.json({ case: req.caseDoc })));
r.post('/cases/:id/map', requireOwnedCase, validate(z.object({ milestoneId: z.string().min(1) })), asyncHandler(async (req, res) => res.json({ case: await mapCase(req.params.id, req.body.milestoneId, req.user.sub) })));
r.post('/cases/:id/analyse', requireOwnedCase, asyncHandler(async (req, res) => res.json({ case: await analyseCase(req.params.id) })));
r.patch('/cases/:id/draft', requireOwnedCase, validate(z.object({ action: z.enum(['FIGHT', 'PARTIAL_REFUND', 'ACCEPT']).optional(), refundCents: z.number().int().min(0).optional(), finalNote: z.string().max(2000).optional() })), asyncHandler(async (req, res) => res.json({ case: await editDraft(req.params.id, req.body) })));
r.post('/cases/:id/approve', requireOwnedCase, validate(z.object({ confirm: z.literal(true) })), asyncHandler(async (req, res) => res.json({ case: await approveCase(req.params.id, req.user.sub) })));
r.post('/cases/:id/submit', requireOwnedCase, asyncHandler(async (req, res) => res.json({ case: await submitCase(req.params.id) })));
r.post('/cases/:id/refresh', requireOwnedCase, asyncHandler(async (req, res) => res.json({ case: await refreshCase(req.params.id) })));
r.post('/cases/:id/sandbox/:op', requireOwnedCase, asyncHandler(async (req, res) => {
 if (process.env.PAYPAL_ENV !== 'sandbox') throw new AppError('SANDBOX_ONLY', 'Sandbox simulation is unavailable outside PayPal Sandbox.', 403);
 const doc = await getCase(req.params.id); if (doc.isReplay) return res.json({ case: doc, simulated: true });
 const remote = await getDispute(doc.paypal.raw.dispute_id);
 const actions = remote.links?.map((link) => link.rel?.toLowerCase().replace(/-/g, '_')) ?? [];
 const op = req.params.op.replace(/-/g, '_'); const paypalOp = op.startsWith('adjudicate_') ? 'adjudicate' : op;
 if (!actions.includes(paypalOp)) throw new AppError('NOT_ALLOWED_NOW', 'The requested sandbox action is not in PayPal HATEOAS links.', 409, { allowedActions: actions });
 if (op === 'require_evidence') await requireEvidence(doc.paypal.raw.dispute_id);
 else if (op === 'adjudicate_seller') await adjudicate(doc.paypal.raw.dispute_id, 'SELLER_FAVOR');
 else if (op === 'adjudicate_buyer') await adjudicate(doc.paypal.raw.dispute_id, 'BUYER_FAVOR');
 else if (op === 'escalate') await escalate(doc.paypal.raw.dispute_id);
 else throw new AppError('INVALID_ACTION', 'Unsupported sandbox simulation operation.', 400);
 res.json({ case: await refreshCase(req.params.id), simulated: true });
}));
export default r;
