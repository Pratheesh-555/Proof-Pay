// Day-1 webhook receiver. Receives PayPal webhooks, verifies signature, logs events.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import { verifyPayPalWebhook } from '../../src/payments/paypal/webhookVerify.js';

const app = express();
const LOG = process.env.WEBHOOK_LOG ?? 'webhook-log.jsonl';
const seen = new Set();

app.get('/health', (_req, res) => res.json({ ok: true, at: new Date().toISOString() }));

// RAW body is mandatory for signature verification. Register before express.json().
app.post('/api/webhooks/paypal', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const rawBody = req.body;
  let event;
  try { event = JSON.parse(rawBody.toString('utf8')); } catch { return res.status(400).end(); }
  const v = await verifyPayPalWebhook({ headers: req.headers, rawBody });
  const entry = { at: new Date().toISOString(), id: event.id, type: event.event_type, verified: v.ok, reason: v.reason, resourceId: event.resource?.id ?? event.resource?.dispute_id ?? event.resource?.invoice?.id, duplicate: seen.has(event.id) };
  seen.add(event.id);
  fs.appendFileSync(LOG, JSON.stringify({ ...entry, resource: event.resource }) + '\n');
  console.log('[webhook]', entry);
  if (!v.ok) return res.status(400).json({ error: 'invalid signature' });
  res.status(200).json({ received: true });
});

app.get('/api/webhooks/recent', (req, res) => {
  if (req.query.token !== process.env.DEBUG_TOKEN) return res.status(403).end();
  if (!fs.existsSync(LOG)) return res.json([]);
  const content = fs.readFileSync(LOG, 'utf8').trim();
  const lines = content ? content.split('\n').slice(-20).map((l) => JSON.parse(l)) : [];
  res.json(lines.reverse());
});

app.use(express.json());

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`day1 webhook server on :${port}`));

