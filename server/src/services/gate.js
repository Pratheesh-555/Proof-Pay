import { canonicalJSON, sha256 } from '../lib/canonical.js';
import { AppError } from '../lib/errors.js';

export const draftHash = (value) => sha256(canonicalJSON(value ?? {}));

export function submissionHash(caseDoc) {
  return draftHash({
    draft: caseDoc.ai?.draft,
    claims: caseDoc.ai?.claims ?? [],
    action: caseDoc.decision?.action,
    refundCents: caseDoc.decision?.refundCents,
    finalNote: caseDoc.finalNote,
    citedEvidenceIds: caseDoc.citedEvidenceIds ?? [],
  });
}

export function assertApproved(caseDoc) {
  if (caseDoc.status !== 'READY' && caseDoc.status !== 'APPROVED') {
    throw new AppError('INVALID_STATE', 'Case must be ready before approval.', 409);
  }
  if (!caseDoc.approval?.draftHash || caseDoc.approval.draftHash !== submissionHash(caseDoc)) {
    throw new AppError('APPROVAL_REQUIRED', 'Approve the current draft before submitting.', 409);
  }
}
