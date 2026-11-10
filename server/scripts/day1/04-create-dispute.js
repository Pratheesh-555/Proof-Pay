// npm run day1:dispute-create -- <BUYER_TRANSACTION_ID> <amount> [SNAD|INR]
// Path A (API). If this fails ONCE with 401/403/PERMISSION_DENIED -> use Path B (manual in sandbox UI). Do not retry-loop.
import 'dotenv/config';
import { buyerAuthAssertion, createDisputeAsBuyer } from '../../src/payments/paypal/disputes.js';

const [buyerTxn, amount = '25.00', kind = 'SNAD'] = process.argv.slice(2);
if (!buyerTxn) { console.error('Usage: npm run day1:dispute-create -- <BUYER_TRANSACTION_ID> <amount> [SNAD|INR]'); process.exit(1); }
const assertion = buyerAuthAssertion({
  clientId: process.env.PAYPAL_CLIENT_ID,
  payerId: process.env.SANDBOX_BUYER_PAYER_ID || undefined,
  email: process.env.SANDBOX_BUYER_EMAIL,
});
try {
  const { disputeId } = await createDisputeAsBuyer({
    buyerTransactionId: buyerTxn,
    reason: kind === 'INR' ? 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED' : 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    value: amount,
    assertion,
  });
  console.log('Dispute created:', disputeId);
  console.log(`Wait 2-5 min (actions appear with delay), then: npm run day1:dispute -- show ${disputeId}`);
} catch (e) {
  console.error(e.message, '\ndebug_id:', e.debugId, '\n', JSON.stringify(e.body?.details ?? e.body, null, 2));
  console.error('\n==> STOP. Use Path B: sandbox.paypal.com as BUYER -> Activity -> the payment -> "Report a problem" (or Resolution Center) -> file dispute.');
  process.exit(2);
}

