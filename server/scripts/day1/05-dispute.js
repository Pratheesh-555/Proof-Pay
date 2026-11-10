// npm run day1:dispute -- show <disputeId> | list | act <disputeId> <action> [amount]
import 'dotenv/config';
import fs from 'node:fs';
import * as D from '../../src/payments/paypal/disputes.js';

const [cmd, id, action, amount] = process.argv.slice(2);

function nextStep(d) {
  const a = D.availableActions(d);
  if (d.status === 'RESOLVED') return `RESOLVED. outcome=${d.dispute_outcome?.outcome_code}`;
  if (a.includes('provide_evidence')) return `act ${d.dispute_id} provide-evidence`;
  if (a.includes('adjudicate')) return `act ${d.dispute_id} adjudicate-seller`;
  if (a.includes('require_evidence')) return `act ${d.dispute_id} require-evidence   (sets WAITING_FOR_SELLER_RESPONSE)`;
  if (a.includes('escalate')) return `act ${d.dispute_id} escalate   (INQUIRY -> CHARGEBACK/claim; then require-evidence)`;
  if (a.includes('make_offer')) return `act ${d.dispute_id} make-offer 5.00   (partial-refund path)`;
  return 'No actions yet. Wait 2-5 minutes and run show again (max 4 tries, then use Simulate/manual path).';
}

if (cmd === 'list') {
  const items = await D.listDisputes();
  for (const x of items) console.log(x.dispute_id, x.status, x.reason, x.dispute_amount?.value, x.dispute_life_cycle_stage);
  process.exit(0);
}
if (!id) { console.error('Usage: see header of this file'); process.exit(1); }
if (cmd === 'show') {
  const d = await D.getDispute(id);
  console.log({ id: d.dispute_id, status: d.status, stage: d.dispute_life_cycle_stage, reason: d.reason, amount: d.dispute_amount, due: d.seller_response_due_date });
  console.log('Disputed txns:', (d.disputed_transactions ?? []).map((t) => ({ seller: t.seller_transaction_id, buyer: t.buyer_transaction_id, invoice_number: t.invoice_number })));
  console.log('Evidence requested:', JSON.stringify(d.evidences ?? [], null, 0));
  console.log('Allowed actions:', D.availableActions(d).join(', ') || '(none)');
  console.log('NEXT ->', nextStep(d));
  process.exit(0);
}
if (cmd === 'act') {
  const run = {
    'escalate': () => D.escalate(id),
    'require-evidence': () => D.requireEvidence(id, 'SELLER_EVIDENCE'),
    'provide-evidence': () => D.provideEvidence(id, {
      evidenceType: 'OTHER',
      notes: 'ProofPay Sandbox integration test: this $5 invoice was created and paid only to verify the PayPal invoice and dispute flows. No real service delivery or external delivery evidence is claimed.',
      files: fs.existsSync('scripts/day1/sample-evidence.pdf')
        ? [{ name: 'evidence.pdf', mime: 'application/pdf', buffer: fs.readFileSync('scripts/day1/sample-evidence.pdf') }]
        : [],
    }),
    'make-offer': () => D.makeOffer(id, { value: amount ?? '5.00', note: 'Partial refund offer (test).' }),
    'accept-claim': () => D.acceptClaim(id, { note: 'Accepting (test).' }),
    'adjudicate-seller': () => D.adjudicate(id, 'SELLER_FAVOR'),
    'adjudicate-buyer': () => D.adjudicate(id, 'BUYER_FAVOR'),
  }[action];
  if (!run) { console.error('Unknown action', action); process.exit(1); }
  try {
    await run();
    console.log(`${action}: OK. Now: npm run day1:dispute -- show ${id}`);
  } catch (e) {
    console.error(`${action} FAILED:`, e.message, '\ndebug_id:', e.debugId, '\n', JSON.stringify(e.body?.details ?? e.body, null, 2));
    console.error('Run "show" to see which actions are actually allowed now. Do not repeat the same failing call.');
    process.exit(2);
  }
}

