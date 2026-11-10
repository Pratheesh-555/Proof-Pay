// npm run day1:invoice -- 25.00
import 'dotenv/config';
import { buildInvoiceBody, createDraftInvoice, sendInvoice, getInvoice, payerUrlOf } from '../../src/payments/paypal/invoices.js';

const amount = process.argv[2] ?? '25.00';
const fakeId = `day1-${Date.now()}`;
const body = buildInvoiceBody({
  invoiceNumber: `PP-${fakeId}`,
  milestone: { _id: fakeId, title: 'Day-1 test milestone: landing page', scope: 'Responsive landing page, deployed', amount: { value: amount, currency: 'USD' }, approval: { approvedAt: new Date() } },
  project: { _id: 'day1-project' },
  client: { name: 'Sandbox Buyer', email: process.env.SANDBOX_BUYER_EMAIL },
  freelancer: { name: 'ProofPay Test Freelancer' },
});
const invoiceId = await createDraftInvoice(body, `create-${fakeId}`);
console.log('Draft invoice:', invoiceId);
const { payerViewUrl } = await sendInvoice(invoiceId, { subject: 'Day-1 test invoice', note: 'Test' });
const inv = await getInvoice(invoiceId);
console.log('Status:', inv.status);
console.log('\nPAY LINK (open in an INCOGNITO window, log in as the sandbox PERSONAL account, pay):');
console.log(payerViewUrl ?? payerUrlOf(inv));
console.log(`\nThen: npm run day1:invoice-status -- ${invoiceId}`);

