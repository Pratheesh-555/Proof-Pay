import { ppFetch, findLink, idFromSelfLink } from './client.js';

export function buildInvoiceBody({ milestone, project, client, freelancer, invoiceNumber }) {
  const value = Number(milestone.amount.value).toFixed(2);
  const currency = milestone.amount.currency ?? 'USD';
  return {
    detail: {
      invoice_number: invoiceNumber,
      reference: `milestone:${milestone._id}`,
      currency_code: currency,
      note: `Milestone "${milestone.title}" approved by ${client.name} on ${new Date(milestone.approval.approvedAt).toISOString()}.`,
      memo: `ProofPay project ${project._id} milestone ${milestone._id}`,
      terms_and_conditions: 'Payment for work approved by the client via ProofPay.',
      payment_term: { term_type: 'DUE_ON_RECEIPT' },
    },
    invoicer: { business_name: freelancer.businessName ?? freelancer.name },
    primary_recipients: [{ billing_info: { name: { full_name: client.name }, email_address: client.email } }],
    items: [{
      name: milestone.title.slice(0, 200),
      description: (milestone.scope ?? '').slice(0, 1000),
      quantity: '1',
      unit_amount: { currency_code: currency, value },
      unit_of_measure: 'AMOUNT',
    }],
    configuration: { allow_tip: false, partial_payment: { allow_partial_payment: false } },
  };
}

export async function createDraftInvoice(body, idempotencyKey) {
  const { data } = await ppFetch('/v2/invoicing/invoices', {
    method: 'POST', body, idempotencyKey, op: 'invoice.create',
    headers: { Prefer: 'return=representation' },
  });
  return data.id ?? idFromSelfLink(data);
}

export async function sendInvoice(invoiceId, { subject, note } = {}) {
  const { data } = await ppFetch(`/v2/invoicing/invoices/${invoiceId}/send`, {
    method: 'POST', op: 'invoice.send',
    body: { send_to_invoicer: true, send_to_recipient: true, subject, note },
  });
  return { payerViewUrl: findLink(data, 'payer-view')?.href ?? data.href ?? null };
}

export async function getInvoice(invoiceId) {
  const { data } = await ppFetch(`/v2/invoicing/invoices/${invoiceId}`, { op: 'invoice.get' });
  return data;
}

export function payerUrlOf(invoice) { return invoice?.detail?.metadata?.recipient_view_url ?? null; }
export function paymentTxnIdsOf(invoice) {
  return (invoice?.payments?.transactions ?? []).map((t) => t.payment_id).filter(Boolean);
}

export async function remindInvoice(invoiceId, { subject, note }) {
  await ppFetch(`/v2/invoicing/invoices/${invoiceId}/remind`, {
    method: 'POST', op: 'invoice.remind', body: { subject, note, send_to_invoicer: true },
  });
}

