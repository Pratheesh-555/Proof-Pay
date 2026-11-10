// npm run day1:env — checks .env, gets a sandbox token, prints the scopes your app has.
import 'dotenv/config';
import { getAccessToken, tokenScopes, PAYPAL_BASE } from '../../src/payments/paypal/client.js';

const required = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'SANDBOX_BUYER_EMAIL', 'GEMINI_API_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) { console.error('Missing in .env:', missing.join(', ')); process.exit(1); }

await getAccessToken();
const scopes = tokenScopes();
console.log('PayPal base:', PAYPAL_BASE);
const need = { invoicing: /invoicing/, disputes: /disputes/, webhooks: /webhook|notifications/ };
for (const [name, re] of Object.entries(need)) {
  console.log(`${scopes.some((s) => re.test(s)) ? 'OK  ' : 'MISS'} scope ~ ${name}`);
}
console.log(`\n${scopes.length} scopes total. If a scope is MISSING: Developer Dashboard -> Apps & Credentials -> your sandbox app -> Features -> enable it, Save, then re-run (tokens are cached ~9h by PayPal, wait a minute).`);

