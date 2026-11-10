import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { ppFetch } from './client.js';

const certCache = new Map();

async function getCert(certUrl) {
  const u = new URL(certUrl);
  if (u.protocol !== 'https:' || !(u.hostname === 'paypal.com' || u.hostname.endsWith('.paypal.com'))) {
    throw new Error(`untrusted cert url host: ${u.hostname}`);
  }
  if (!certCache.has(certUrl)) {
    const res = await fetch(certUrl);
    if (!res.ok) throw new Error(`cert fetch failed: ${res.status}`);
    certCache.set(certUrl, await res.text());
  }
  return certCache.get(certUrl);
}

const hdr = (headers, k) => headers[k] ?? headers[k.toLowerCase()];

export async function verifyOffline({ headers, rawBody, webhookId }) {
  const transmissionId = hdr(headers, 'paypal-transmission-id');
  const time = hdr(headers, 'paypal-transmission-time');
  const certUrl = hdr(headers, 'paypal-cert-url');
  const sig = hdr(headers, 'paypal-transmission-sig');
  if (!transmissionId || !time || !certUrl || !sig) return { ok: false, reason: 'missing PayPal headers' };
  const message = `${transmissionId}|${time}|${webhookId}|${zlib.crc32(rawBody)}`;
  const cert = new crypto.X509Certificate(await getCert(certUrl));
  const ok = crypto.verify('sha256', Buffer.from(message), cert.publicKey, Buffer.from(sig, 'base64'));
  return { ok, reason: ok ? null : 'signature mismatch' };
}

export async function verifyOnline({ headers, rawBody, webhookId }) {
  const { data } = await ppFetch('/v1/notifications/verify-webhook-signature', {
    method: 'POST', op: 'webhook.verify',
    body: {
      auth_algo: hdr(headers, 'paypal-auth-algo'),
      cert_url: hdr(headers, 'paypal-cert-url'),
      transmission_id: hdr(headers, 'paypal-transmission-id'),
      transmission_sig: hdr(headers, 'paypal-transmission-sig'),
      transmission_time: hdr(headers, 'paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody.toString('utf8')),
    },
  });
  return { ok: data.verification_status === 'SUCCESS', reason: data.verification_status };
}

export async function verifyPayPalWebhook({ headers, rawBody }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const mode = process.env.WEBHOOK_VERIFY ?? 'offline';
  if (mode === 'off') {
    if (process.env.NODE_ENV === 'production') return { ok: false, reason: 'verification disabled in production' };
    return { ok: true, reason: 'SKIPPED (dev)' };
  }
  if (!webhookId) return { ok: false, reason: 'PAYPAL_WEBHOOK_ID missing' };
  try {
    return mode === 'online'
      ? await verifyOnline({ headers, rawBody, webhookId })
      : await verifyOffline({ headers, rawBody, webhookId });
  } catch (e) {
    return { ok: false, reason: `verify error: ${e.message}` };
  }
}

