import { ppFetch, normRel } from './client.js';

export function availableActions(dispute) {
  return (dispute?.links ?? []).map((l) => normRel(l.rel)).filter((r) => r !== 'self');
}
export const can = (dispute, action) => availableActions(dispute).includes(normRel(action));

export async function getDispute(id) {
  return (await ppFetch(`/v1/customer/disputes/${id}`, { op: 'dispute.get' })).data;
}

export async function listDisputes({ disputedTransactionId, pageSize = 20 } = {}) {
  const q = new URLSearchParams({ page_size: String(pageSize) });
  if (disputedTransactionId) q.set('disputed_transaction_id', disputedTransactionId);
  return (await ppFetch(`/v1/customer/disputes?${q}`, { op: 'dispute.list' })).data.items ?? [];
}

export async function provideEvidence(id, { evidenceType = 'OTHER', notes, files = [] }) {
  const evidence = { evidence_type: evidenceType, notes: String(notes ?? '').slice(0, 2000) };
  if (files.length) evidence.documents = files.map((f) => ({ name: f.name }));
  const multipart = [
    { name: 'input', contentType: 'application/json', data: JSON.stringify({ evidences: [evidence] }) },
    ...files.map((f, i) => ({ name: `file${i + 1}`, filename: f.name, contentType: f.mime, data: f.buffer })),
  ];
  return (await ppFetch(`/v1/customer/disputes/${id}/provide-evidence`, { method: 'POST', multipart, op: 'dispute.provideEvidence' })).data;
}

export async function provideSupportingInfo(id, { notes, files = [] }) {
  const multipart = [
    { name: 'input', contentType: 'application/json', data: JSON.stringify({ notes: String(notes ?? '').slice(0, 2000) }) },
    ...files.map((f) => ({ name: 'supporting_document', filename: f.name, contentType: f.mime, data: f.buffer })),
  ];
  return (await ppFetch(`/v1/customer/disputes/${encodeURIComponent(id)}/provide-supporting-info`, { method: 'POST', multipart, op: 'dispute.provideSupportingInfo' })).data;
}

export async function makeOffer(id, { value, currency = 'USD', note, offerType = 'REFUND' }) {
  return (await ppFetch(`/v1/customer/disputes/${id}/make-offer`, {
    method: 'POST', op: 'dispute.makeOffer',
    body: { note, offer_amount: { currency_code: currency, value: Number(value).toFixed(2) }, offer_type: offerType },
  })).data;
}

export async function acceptClaim(id, { note, type = 'REFUND', value, currency = 'USD' }) {
  const body = { note, accept_claim_type: type };
  if (type === 'PARTIAL_REFUND') body.refund_amount = { currency_code: currency, value: Number(value).toFixed(2) };
  return (await ppFetch(`/v1/customer/disputes/${id}/accept-claim`, { method: 'POST', op: 'dispute.acceptClaim', body })).data;
}

export async function sendMessage(id, message) {
  return (await ppFetch(`/v1/customer/disputes/${id}/send-message`, { method: 'POST', op: 'dispute.sendMessage', body: { message } })).data;
}

export async function escalate(id, note = 'Escalating to claim for PayPal review.') {
  return (await ppFetch(`/v1/customer/disputes/${id}/escalate`, { method: 'POST', op: 'dispute.escalate', body: { note } })).data;
}

// Sandbox-only actions; callers must also enforce PAYPAL_ENV === 'sandbox'.
export async function requireEvidence(id, action = 'SELLER_EVIDENCE') {
  if (process.env.PAYPAL_ENV !== 'sandbox') throw new Error('require-evidence is available only with PAYPAL_ENV=sandbox');
  return (await ppFetch(`/v1/customer/disputes/${id}/require-evidence`, { method: 'POST', op: 'dispute.requireEvidence', body: { action } })).data;
}
export async function adjudicate(id, outcome = 'SELLER_FAVOR') {
  if (process.env.PAYPAL_ENV !== 'sandbox') throw new Error('adjudicate is available only with PAYPAL_ENV=sandbox');
  return (await ppFetch(`/v1/customer/disputes/${id}/adjudicate`, { method: 'POST', op: 'dispute.adjudicate', body: { adjudication_outcome: outcome } })).data;
}

export function buyerAuthAssertion({ clientId, payerId, email }) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const payload = payerId ? { iss: clientId, payer_id: payerId } : { iss: clientId, email };
  return `${b64({ alg: 'none' })}.${b64(payload)}.`;
}

export async function createDisputeAsBuyer({ buyerTransactionId, reason, value, currency = 'USD', assertion, issueType = 'SERVICE' }) {
  const input = {
    disputed_transactions: [{ buyer_transaction_id: buyerTransactionId }],
    reason,
    dispute_amount: { currency_code: currency, value: Number(value).toFixed(2) },
    extensions: {
      merchant_contacted: true,
      merchant_contacted_outcome: 'NOT_FIXED',
      merchandize_dispute_properties: { issue_type: issueType },
    },
  };
  const { data } = await ppFetch('/v1/customer/disputes', {
    method: 'POST', op: 'dispute.create', headers: { 'PayPal-Auth-Assertion': assertion },
    multipart: [{ name: 'input', contentType: 'application/json', data: JSON.stringify(input) }],
  });
  const self = (data.links ?? []).find((l) => l.rel === 'self')?.href;
  return { disputeId: self?.split('/').pop() ?? data.dispute_id, raw: data };
}

