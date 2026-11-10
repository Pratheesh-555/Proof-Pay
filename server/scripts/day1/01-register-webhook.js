// npm run day1:webhook -- https://your-app.onrender.com/api/webhooks/paypal
import 'dotenv/config';
import { ppFetch } from '../../src/payments/paypal/client.js';

const url = process.argv[2];
if (!url?.startsWith('https://')) { console.error('Usage: npm run day1:webhook -- https://<public-host>/api/webhooks/paypal'); process.exit(1); }

const EVENTS = [
  'INVOICING.INVOICE.PAID', 'INVOICING.INVOICE.CANCELLED', 'INVOICING.INVOICE.REFUNDED',
  'CUSTOMER.DISPUTE.CREATED', 'CUSTOMER.DISPUTE.UPDATED', 'CUSTOMER.DISPUTE.RESOLVED',
];

const { data } = await ppFetch('/v1/notifications/webhooks', { op: 'webhooks.list' });
const existing = (data.webhooks ?? []).find((w) => w.url === url);
if (existing) {
  console.log('Webhook already exists for this URL.');
  console.log('PAYPAL_WEBHOOK_ID=' + existing.id);
  console.log('Subscribed:', existing.event_types.map((e) => e.name).join(', '));
  process.exit(0);
}
const created = await ppFetch('/v1/notifications/webhooks', {
  method: 'POST', op: 'webhooks.create',
  body: { url, event_types: EVENTS.map((name) => ({ name })) },
});
console.log('Created. Put this in .env AND in Render env vars:');
console.log('PAYPAL_WEBHOOK_ID=' + created.data.id);

