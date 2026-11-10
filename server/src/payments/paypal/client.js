// The ONLY place that talks HTTP to PayPal. Everything else imports from here.
const BASE = 'https://api-m.sandbox.paypal.com';

export class PayPalError extends Error {
  constructor(op, status, body, debugId) {
    super(`PayPal ${op} failed: HTTP ${status} ${body?.name ?? ''} ${body?.message ?? ''}`.trim());
    this.op = op;
    this.status = status;
    this.body = body;
    this.debugId = debugId;
  }
}

let cached = { token: null, exp: 0, scope: '' };

export async function getAccessToken() {
  if (cached.token && Date.now() < cached.exp - 60_000) return cached.token;
  if (process.env.PAYPAL_ENV === 'live') throw new Error('ProofPay is Sandbox-only; PAYPAL_ENV=live is not supported');
  const { PAYPAL_CLIENT_ID: id, PAYPAL_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET missing');
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) throw new PayPalError('oauth', res.status, data, res.headers.get('paypal-debug-id'));
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000, scope: data.scope ?? '' };
  return cached.token;
}

export function tokenScopes() { return cached.scope.split(' ').filter(Boolean); }

/** Build multipart/form-data in the format PayPal accepts. */
export function buildMultipart(parts) {
  const boundary = `----proofpay${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  const chunks = [];
  for (const p of parts) {
    let head = `--${boundary}\r\nContent-Disposition: form-data; name="${p.name}"`;
    if (p.filename) head += `; filename="${p.filename}"`;
    head += '\r\n';
    if (p.contentType) head += `Content-Type: ${p.contentType}\r\n`;
    chunks.push(Buffer.from(head + '\r\n'), Buffer.isBuffer(p.data) ? p.data : Buffer.from(String(p.data)), Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

export async function ppFetch(path, { method = 'GET', body, multipart, headers = {}, idempotencyKey, op = path } = {}) {
  const token = await getAccessToken();
  const h = { Authorization: `Bearer ${token}`, ...headers };
  let payload;
  if (multipart) { const m = buildMultipart(multipart); h['Content-Type'] = m.contentType; payload = m.body; }
  else if (body !== undefined) { h['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  if (idempotencyKey) h['PayPal-Request-Id'] = idempotencyKey;

  const res = await fetch(`${BASE}${path}`, { method, headers: h, body: payload });
  const debugId = res.headers.get('paypal-debug-id');
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new PayPalError(op, res.status, data, debugId);
  return { status: res.status, data, debugId, headers: res.headers };
}

export const normRel = (rel) => String(rel).toLowerCase().replace(/-/g, '_');
export const findLink = (obj, rel) => obj?.links?.find((l) => normRel(l.rel) === normRel(rel));
export const idFromSelfLink = (obj) => findLink(obj, 'self')?.href?.split('/').pop();
export { BASE as PAYPAL_BASE };

