// npm run day1:invoice-status -- INV2-XXXX-XXXX
import 'dotenv/config';
import { getInvoice, paymentTxnIdsOf } from '../../src/payments/paypal/invoices.js';

const id = process.argv[2];
if (!id) { console.error('Usage: npm run day1:invoice-status -- <invoiceId>'); process.exit(1); }
const inv = await getInvoice(id);
console.log('Status:', inv.status, '| number:', inv.detail?.invoice_number, '| reference:', inv.detail?.reference);
console.log('Seller-side payment txn ids:', paymentTxnIdsOf(inv));
console.log('Payments block:', JSON.stringify(inv.payments ?? {}, null, 2));
console.log('\nSAVE the seller txn id. The BUYER txn id is different: sandbox.paypal.com as the buyer -> Activity -> this payment -> Transaction ID. Disputes are created with the BUYER id.');

