# ProofPay — PRD + Step-by-Step Build Guide

> **Status note (11 Nov 2026):** This document preserves the original requirements and build checklist. The unchecked tasks are not a current remaining-work list, and planned stories are not necessarily implemented. Use [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) for the as-built feature scope and [`DEVPOST_SUBMISSION.md`](DEVPOST_SUBMISSION.md) for claims safe to use in the submission.

> **Version** 1.0 · 6 Nov 2026 · Deadline **12 Nov 2026, 12:00 PM PT = 13 Nov, 1:30 AM IST**. Our target: submit **12 Nov evening IST**.
> **Part A** = what we build and why (PRD; it also replaces the older problem doc). **Part B** = the order we build it in, with checks and a fallback for every step.
> Owners: **B** = backend / PayPal / AI · **F** = frontend / design / video · **B+F** = both.

---

# PART A — PRD

## A.1 One line

**"Clients approve the work, PayPal invoices go out automatically, and if anyone disputes later, the AI has your case ready."**

## A.2 Problem (final framing)

Freelancers who sell **services** (developers, designers, video editors; many in India with clients abroad) get paid through **PayPal invoices**. Two connected pains:

1. **Getting paid at all.** An invoice is sent before anyone has formally agreed the work is done, so "I haven't checked it yet" becomes weeks of chasing.
2. **Losing disputes on real work.** Clients sometimes dispute later ("not received" / "not as described"). A service has no tracking number; the proof is scattered across GitHub, WhatsApp, email and Drive; the response window is short (team research: about **10 days** once a dispute becomes a claim); and PayPal Seller Protection does not cover "not as described" claims (team research says intangible services may be excluded entirely). Freelancers lose money even when the work was real.

> ⚠️ Before quoting the 10-day window or the Seller Protection scope in the video or README, re-check them on PayPal's Help Center / User Agreement and cite the page. (Open research item R3.)

**Root cause:** proof is captured *after* the dispute, by hand, from scattered places — and invoicing is not tied to an explicit approval.

**ProofPay's answer:** capture proof **at delivery**, invoice **only after the client approves**, and answer disputes **inside PayPal's own process** with every claim cited and a human approving before anything is sent.

## A.3 Users

| Persona | Context | Needs |
|---|---|---|
| **Priya**, freelance React developer, Pune (primary) | 3–6 clients/yr in US/EU, $300–$3,000 milestones, PayPal invoices | Get paid fast; not lose a month's income to one dispute; no time to assemble evidence |
| **Sarah**, startup founder, Austin (client) | Hires freelancers, reviews on her phone | See what was delivered, approve in 30 s, pay with PayPal |
| **PayPal reviewer** (indirect) | Reads seller response | Short, factual, checkable claims with documents |

## A.4 Goals and non-goals

**Goals (hackathon):**
- G1: End-to-end flow on real PayPal sandbox: deliver → approve → invoice → pay → dispute → AI case → human approve → submit → sandbox settle.
- G2: Every AI claim is backed by evidence; unsupported claims are visibly removed.
- G3: Judges can try it themselves until 15 Dec 2026 without filing a sandbox dispute.
- G4: Polished, honest UI and a ≤ 3-minute video.

**Non-goals:** sign-up/OAuth, contracts/e-signing, payment methods other than PayPal, production PayPal, Lock & Release (authorize/capture) — README "next steps" only, multi-currency.

## A.5 Scope and user stories

**P0 = must ship (demo breaks without it). P1 = ship if on schedule. P2 = README only.**

| ID | Pri | Story | Acceptance criteria |
|---|---|---|---|
| US-1 | P0 | As Priya I create a project with a client and a GitHub repo | Project saved; client link shown once with copy button; refund cap default 30% editable |
| US-2 | P0 | As Priya I create milestones with scope, acceptance criteria and amount | ≥1 criterion required; amount in USD; status DRAFT |
| US-3 | P0 | As Priya I mark a milestone delivered and ProofPay collects proof | Release + commits + deploy check collected (each optional); items show VERIFIED/CLAIMED; ledger "chain intact" |
| US-4 | P0 | As Sarah I open the link on my phone, see what was delivered and approve | No login; approval stores name, time, snapshot hash; the page shows "Pay with PayPal" within 10 s |
| US-5 | P0 | As Sarah I can request changes instead | Note stored as evidence; no invoice sent; Priya sees it |
| US-6 | P0 | A PayPal invoice is sent automatically after approval | Invoice in sandbox with `reference = milestone:<id>`; payer link works; status SENT |
| US-7 | P0 | Payment is recorded automatically | `INVOICING.INVOICE.PAID` (or poller) → milestone PAID within 1 min; seller txn id stored |
| US-8 | P0 | A dispute creates a case linked to the right milestone | `CUSTOMER.DISPUTE.CREATED` → case mapped (method + confidence shown) within 60 s |
| US-9 | P0 | The AI tells Priya whether the work was done, what to do, and drafts the reply | D1 table per criterion; D2 action with policy reasons; D3 draft with `[E#]` citations; removed claims struck through with reason |
| US-10 | P0 | Priya approves and ProofPay submits to PayPal | Submit disabled until approved; editing clears approval; PayPal response + debug id shown; timeline updated |
| US-11 | P0 | Sandbox settlement is shown honestly | Button labelled "Simulate PayPal decision (sandbox)"; RESOLVED webhook → outcome + "money protected" KPI |
| US-12 | P0 | Dashboard with AG Grid | Cases grid + Milestones grid with the columns in LLD §11.3; KPI tiles |
| US-13 | P0 | Judges can test | README creds; Replay mode; ≥3 open sandbox disputes listed |
| US-14 | P1 | AI reminders for unpaid invoices | Max 3, cite approval, sent via Agent Toolkit; visible list; "send now" |
| US-15 | P1 | Evidence PDF | Downloadable; attached to provide-evidence |
| US-16 | P1 | Partial refund path | Offer ≤ cap via make-offer / accept-claim PARTIAL_REFUND |
| US-17 | P1 | Upload files / notes as CLAIMED evidence | ≤10 MB pdf/png/jpg; sha256 shown |
| US-18 | P2 | Lock & Release, multi-provider, Indian export compliance | README only |

## A.6 Screens (F owns design; LLD §11 has elements)

Login · Dashboard (KPIs + AG Grid) · Project · Milestone (deliver + evidence) · **Client review page (mobile-first)** · **Dispute case** (the main screen in the video) · Judge/demo panel.

UX rules: plain labels next to colours; one primary button per screen; every AI output has a "why" visible without clicking; anything sandbox-only looks different (dashed + "sandbox" tag); error messages show what to do next.

## A.7 Success metrics

| Metric | Target |
|---|---|
| Full sandbox flow on deployed URL | Works 3 times in a row on 11 Nov |
| Dispute webhook → case ready | < 60 s |
| Eval: decision accuracy (8 cases) | ≥ 7/8 |
| Eval: citation coverage | 100% |
| Eval: planted false claims removed | ≥ 90% |
| Cap violations | 0 |
| Video length | ≤ 2:55 |

## A.8 Competition and our answer

| Product | What it does | Gap we fill |
|---|---|---|
| Chargeflow, ChargePay | AI chargeback/dispute automation for online stores, ~25% success fee | Built for goods + stores, not service milestones; evidence gathered after the dispute |
| Workstamped | Freelancer proof and milestones | No PayPal invoicing/dispute response |
| Upwork / Fiverr | Platform escrow | 10–20% fees, platform lock-in |
| **ProofPay** | Proof at delivery → approval-gated PayPal invoice → cited, human-approved response inside PayPal disputes | |

## A.9 Judging criteria → what we show

| Criterion (equal weight) | Evidence in our submission |
|---|---|
| Technological implementation | Real Invoicing v2 + Disputes v1 + signed webhooks + Agent Toolkit + Gemini; tests + eval table; hash-chained ledger |
| Design | Client page on phone; case screen with citations and removed claims; AG Grid dashboard |
| Potential impact | Freelancers in India → clients abroad; 1 real freelancer quote (research R7) |
| Innovation | Approval-gated invoicing + verifier that removes unsupported claims + tamper-evident evidence |
| Presentation | 3-min story with one "wow" moment; honest sandbox labels; clear README |

Honorable-mention target: **Best Use of PayPal + AI**. Sponsor target: **AG Grid**.

## A.10 Demo video script (≤ 3:00) — F writes the final version by 8 Nov

| Time | Scene | On screen |
|---|---|---|
| 0:00–0:15 | Hook | "Priya delivered. Three weeks later: 'not as described'. 10 days to respond. Proof is everywhere." |
| 0:15–0:40 | Deliver | Mark delivered → release, commits, deploy check appear as VERIFIED; ledger "chain intact" |
| 0:40–1:05 | Client approves on phone | Approve → "Pay with PayPal" → sandbox payment → dashboard flips to PAID (webhook) |
| 1:05–2:10 | **Wow: dispute** | Real sandbox dispute arrives → case ready → criteria table → FIGHT (policy reasons) → draft with [E#] → a false claim struck out → Approve → Submit → PayPal 200 → "Simulate PayPal decision (sandbox)" → Won, money protected +$500 |
| 2:10–2:35 | Honesty + scale | An ACCEPT case ("evidence too weak — refund is the right call"); AG Grid dashboard; eval table |
| 2:35–2:55 | Close | Stack line (PayPal Invoicing, Disputes, Webhooks, Agent Toolkit + Gemini); one line of impact |

No copyrighted music, no third-party logos without permission (GitHub/WhatsApp logos → plain text labels).

## A.11 Submission checklist (Devpost)

- [ ] Public GitHub repo, **MIT LICENSE file**, license visible in repo **About**
- [ ] README: what/why, architecture image, setup steps, **judge guide** (URL, freelancer login, sandbox buyer login, open dispute IDs, Replay), **AI tools used and how**, eval table, honest limitations, next steps
- [ ] Hosted demo URL live (Render Free; first visit can take about a minute after idle) — **must remain available through judging**
- [ ] YouTube video public, < 3:00, shows the app running
- [ ] Devpost description with features + AI tools section
- [ ] AG Grid used visibly (and trial key valid through 15 Dec, or Community only)
- [ ] All secrets in Render env; `.env` not in git history

## A.12 Fallback product: ExportReady (only if the dispute gate fails by 7 Nov 12:00 IST)

PayPal invoicing + Indian export compliance: purpose codes on invoices, LUT declaration line, matching PayPal payouts to e-FIRA and GSTR-1 Table 6A. **Carries over:** PayPal client, invoices, webhooks, client approval page, evidence ledger, AG Grid. **Replaced:** dispute pipeline → AI compliance checker. Decide in the 7 Nov noon sync; don't half-build both.

## A.13 Open research items (owner)

| # | Item | Owner | Due |
|---|---|---|---|
| R1 | INVOICE.PAID payload shape + where the seller txn id lives | B | 6 Nov (Day-1) |
| R2 | Does a dispute on an invoice payment carry `invoice_number`? | B | 6 Nov |
| R3 | 10-day response window + Seller Protection scope for services (cite PayPal pages) | B | 8 Nov |
| R4 | Do sandbox disputes stay open until 15 Dec? | B | 9 Nov (check age of Day-1 dispute) |
| R5 | AG Grid prize criteria; Community vs Enterprise; licence key handling | F | 6 Nov |
| R6 | 3–4 past Devpost winner videos: first 15 s pattern | F | 7 Nov |
| R7 | Talk to 3–5 freelancers; get 1 quotable line (with permission) | B+F | 9 Nov |

---

# PART B — STEP-BY-STEP BUILD GUIDE

## B.0 How to use these files

**Read order for any human or coding agent:** `CLAUDE.md` → this file (the current step only) → the LLD section the step points to → HLD only for "why".

**Starting a coding-agent session (copy this):**
```
Read CLAUDE.md first. Then read docs/PRD_AND_BUILD_GUIDE.md step <S#> only, and the LLD sections it references.
Implement exactly that step. Do not modify pinned package versions. Do not refactor files outside the step.
Run the step's "Done when" checks and show me the output.
Follow the Anti-Loop Protocol (guide B.1). When finished, update the Status section in CLAUDE.md.
```

## B.1 Anti-Loop Protocol (applies to humans and agents)

1. **Two strikes.** Same error twice (same op + same HTTP status/issue, or same stack line) → **stop fixing**. Look it up in the playbook (B.10). Apply that fix **once**.
2. **Still failing → take the step's listed fallback.** Don't invent a third approach unless the step lists one.
3. **Write it down** in `docs/BLOCKERS.md` (template below) and move on to the next step. Raise it at the evening sync.
4. **Timebox:** 30 minutes per blocker for humans; 2 fix attempts per error for agents.
5. **Isolate first:** reproduce with the smallest script (`scripts/day1/*`) before touching app code.
6. **Always capture:** `op`, HTTP status, `body.name`, `body.details[0].issue`, `debug_id`, and the request you sent.
7. **Never:** upgrade pinned packages to "fix" something; disable webhook verification in production; add retry loops without a max; rewrite a working module to fix a different one; "fix" by deleting a test.

`docs/BLOCKERS.md` template:
```
## <date time> — <step> — <one-line symptom>
- Op / endpoint:
- Error (status, name, issue, debug_id):
- Tried (max 2):
- Fallback taken:
- Impact on demo:
- Owner / next check:
```

## B.2 Plan by day

| Day | B steps | F steps | Sync |
|---|---|---|---|
| Thu 6 Nov | **S0, S1 (Day-1 gate)** | S0-F, F1 (skeleton, design direction), research R5 | 21:00 IST — API contract freeze (LLD §6); go/no-go on disputes |
| Fri 7 Nov | S2 (app skeleton + deploy), S3 (models, auth, projects, milestones) | F2 (project + milestone screens), F3 (client page on mock) | **12:00 IST fallback decision** |
| Sat 8 Nov | S4 (approval → invoice → paid), S5 (evidence + ledger) | F4 (evidence view + badges), connect F2/F3 to API, **video script v1** | |
| Sun 9 Nov | S6 (dispute intake + mapping), S7 (AI pipeline) | F5 (case screen + approval) | |
| Mon 10 Nov | S8 (submission + sandbox settle), S9 (PDF, reminders), S10 (demo/replay, case pool) — **feature freeze 22:00** | F6 (AG Grid dashboard), polish, storyboard | |
| Tue 11 Nov | S11 (tests, eval, README, judge access) | F7 record + edit video, Devpost text/images | Full dry run ×3 on prod |
| Wed 12 Nov | S12 submit (B+F) by evening IST | | |

---

## S0 — Accounts and setup (B 60 min, F 30 min)

**B checklist**
- [ ] developer.paypal.com → log in → **Testing Tools → Sandbox Accounts**: confirm one **Business** and one **Personal** account exist (create if not). For the Personal account, note **email**, **password** (View/Edit) and **Payer ID** (account details). Make sure the Business account has a balance (needed for refunds/offers).
- [ ] **Apps & Credentials → Sandbox → Create App** "ProofPay" (merchant type) under the Business account → copy Client ID + Secret. In the app's features, make sure **Invoicing** and **Disputes** are enabled (the Day-1 script prints the scopes).
- [ ] MongoDB Atlas: create a least-privilege DB user and allowlist the current Render service outbound IP ranges shown in **Render → service → Connect → Outbound**. Avoid `0.0.0.0/0` except as a temporary, deliberate diagnostic; if used, remove it after connectivity works. See [Render's Atlas connection guide](https://render.com/docs/connect-to-mongodb-atlas).
- [ ] Google AI Studio: Gemini API key. Note which Gemini model names your key lists (`GEMINI_MODEL`).
- [ ] GitHub: create the **public demo repo** whose releases/commits we'll show (e.g. `acme-landing-demo`), push a few commits, create release `v1.0`. Fine-grained PAT, read-only on that repo.
- [ ] Render: create the full app from the public GitHub repo using root `render.yaml` (Free plan). Set the required secrets, then add the deployed URL and webhook ID. The seed runs on startup because Free has no shell or one-off jobs.
- [ ] Create our repo `proofpay` (public), add **MIT LICENSE**, set About → license.

**F checklist**
- [ ] AG Grid / AG Studio trial started **today** (45 days → ~21 Dec, covers judging to 15 Dec). Read the AG Grid prize page (R5).
- [ ] Figma / design direction: 2 options for the case screen + client page.

**Done when:** `.env` filled (B), Render service exists, repo public with LICENSE.

---

## S1 — Day-1 sandbox gate (B, ~4 h) — the riskiest part, do it first

Goal: prove the 5 things in order: **(1)** buyer pays an invoice → **(2)** dispute on that payment → **(3)** webhook reaches Render → **(4)** provide-evidence works → **(5)** adjudicate settles.

### S1.1 Files (copy exactly; they were syntax-checked and the request formats tested)

`server/package.json`
```json
{
  "name": "proofpay-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.2"
  },
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "day1:env": "node scripts/day1/00-check-env.js",
    "day1:webhook": "node scripts/day1/01-register-webhook.js",
    "day1:invoice": "node scripts/day1/02-create-send-invoice.js",
    "day1:invoice-status": "node scripts/day1/03-invoice-status.js",
    "day1:dispute-create": "node scripts/day1/04-create-dispute.js",
    "day1:dispute": "node scripts/day1/05-dispute.js",
    "day1:gemini": "node scripts/day1/06-gemini-smoke.js",
    "day1:server": "node scripts/day1/webhook-server.js",
    "test": "node --test --experimental-test-module-mocks \"test/**/*.test.js\"",
    "eval": "node scripts/eval/run-eval.js",
    "seed": "node scripts/seed.js",
    "case-pool": "node scripts/case-pool.js"
  },
  "dependencies": {
    "@ai-sdk/google": "1.2.22",
    "@paypal/agent-toolkit": "1.11.0",
    "ai": "4.3.19",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.6.1",
    "express": "^4.22.3",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.24.8",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "pdfkit": "^0.15.2",
    "zod": "^3.24.2"
  }
}
```

`server/.env.example`
```bash
# ---- copy to server/.env (never commit .env) ----
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/proofpay
JWT_SECRET=change-me-64-hex
CLIENT_LINK_SECRET=change-me-64-hex
IP_HASH_SALT=change-me-32-hex
SEED_FREELANCER_EMAIL=demo@proofpay.dev
SEED_FREELANCER_PASSWORD=change-me

# PayPal sandbox (Developer Dashboard -> Apps & Credentials -> Sandbox -> your app)
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
WEBHOOK_VERIFY=offline
# Sandbox PERSONAL (buyer) account (Dashboard -> Testing Tools -> Sandbox Accounts)
SANDBOX_BUYER_EMAIL=
SANDBOX_BUYER_PAYER_ID=

# AI
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
AGENT_MODE=tools

# GitHub fine-grained PAT (read-only: Contents, Metadata) for the demo repo
GITHUB_TOKEN=

REMINDER_INTERVAL_MINUTES=1440
DISPUTE_POLL_MINUTES=5
DEBUG_TOKEN=change-me
```

The earlier Day-1-only Render webhook service was retired. Use the repository-root `render.yaml` for the complete app; do not deploy a separate webhook-only service.

`server/src/payments/paypal/client.js`, `invoices.js`, `disputes.js`, `webhookVerify.js` → copy from **LLD §8.1–8.4** (same code).

`server/scripts/day1/00-check-env.js`
```js
// server/scripts/day1/00-check-env.js
// npm run day1:env  — checks .env, gets a sandbox token, prints the scopes your app has.
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
```

`server/scripts/day1/01-register-webhook.js`
```js
// server/scripts/day1/01-register-webhook.js
// npm run day1:webhook -- https://your-app.onrender.com/api/webhooks/paypal
// Creates (or reuses) a webhook for our events and prints PAYPAL_WEBHOOK_ID.
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
```

`server/scripts/day1/02-create-send-invoice.js`
```js
// server/scripts/day1/02-create-send-invoice.js
// npm run day1:invoice -- 25.00
// Creates + sends a sandbox invoice to SANDBOX_BUYER_EMAIL and prints the pay link.
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
```

`server/scripts/day1/03-invoice-status.js`
```js
// server/scripts/day1/03-invoice-status.js
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
```

`server/scripts/day1/04-create-dispute.js`
```js
// server/scripts/day1/04-create-dispute.js
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
```

`server/scripts/day1/05-dispute.js`
```js
// server/scripts/day1/05-dispute.js
// npm run day1:dispute -- show <disputeId>
// npm run day1:dispute -- list
// npm run day1:dispute -- act <disputeId> <escalate|require-evidence|provide-evidence|make-offer|accept-claim|adjudicate-seller|adjudicate-buyer> [amount]
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
      notes: 'Day-1 test: client approved milestone on ProofPay; GitHub release v1.0 and deploy URL attached.',
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
```

`server/scripts/day1/06-gemini-smoke.js`
```js
// server/scripts/day1/06-gemini-smoke.js
// npm run day1:gemini -- [disputeId]
// 1) structured output works?  2) multi-step tool calling with PayPal Agent Toolkit works?
// Result decides AGENT_MODE: "tools" (A) or "direct" (B). See IMPLEMENTATION guide.
import 'dotenv/config';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { PayPalAgentToolkit } from '@paypal/agent-toolkit/ai-sdk';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const model = google(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite');

const { object } = await generateObject({
  model,
  schema: z.object({ verdict: z.enum(['MET', 'NOT_MET', 'UNCLEAR']), evidenceIds: z.array(z.string()), reason: z.string() }),
  prompt: 'Criterion: "Site is deployed". Evidence: [E1] deploy URL returned HTTP 200 on 2026-11-05. [E2] client clicked Approve. Decide.',
});
console.log('1) generateObject OK:', object);

const disputeId = process.argv[2];
if (!disputeId) { console.log('2) skipped (pass a dispute id to test tool calling)'); process.exit(0); }
const toolkit = new PayPalAgentToolkit({
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  configuration: { actions: { disputes: { get: true, list: true }, invoices: { get: true } }, context: { sandbox: true } },
});
try {
  const res = await generateText({
    model,
    tools: toolkit.getTools(),
    maxSteps: 4,
    prompt: `Fetch PayPal dispute ${disputeId} and tell me its reason, status and the seller transaction id. Be brief.`,
  });
  console.log('2) tool steps:', res.steps.length, '| tools called:', res.steps.flatMap((s) => s.toolCalls.map((c) => c.toolName)));
  console.log('   answer:', res.text);
  console.log('==> AGENT_MODE=tools works');
} catch (e) {
  console.error('2) tool calling FAILED:', e.message);
  console.error('==> Set AGENT_MODE=direct (orchestrator calls toolkit tools itself; LLM only does generateObject). Do not debug further today.');
}
```

`server/scripts/day1/webhook-server.js`
```js
// server/scripts/day1/webhook-server.js
// npm run day1:server   (deploy this to Render on Day 1; it becomes src/index.js later)
// Receives PayPal webhooks, verifies signature, appends to webhook-log.jsonl, shows recent events.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import { verifyPayPalWebhook } from '../../src/payments/paypal/webhookVerify.js';

const app = express();
const LOG = process.env.WEBHOOK_LOG ?? 'webhook-log.jsonl';
const seen = new Set();

app.get('/health', (_req, res) => res.json({ ok: true, at: new Date().toISOString() }));

// RAW body is mandatory for signature verification. This route must be registered BEFORE express.json().
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
  const lines = fs.readFileSync(LOG, 'utf8').trim().split('\n').slice(-20).map((l) => JSON.parse(l));
  res.json(lines.reverse());
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`day1 webhook server on :${port}`));
```

### S1.2 Run order

```bash
cd server && npm install            # Node 22.2+  (node -v)
cp .env.example .env                # fill PayPal, buyer, Gemini values
npm run day1:env                    # (a) token + scopes
# push repo → Render deploys webhook-server → open https://<app>.onrender.com/health
npm run day1:webhook -- https://<app>.onrender.com/api/webhooks/paypal   # (b) prints PAYPAL_WEBHOOK_ID
#   → put PAYPAL_WEBHOOK_ID in .env AND Render env, redeploy
npm run day1:invoice -- 25.00       # (c) prints pay link
#   → open link in INCOGNITO, log in as sandbox PERSONAL account, pay
npm run day1:invoice-status -- INV2-XXXX-XXXX     # (d) PAID + seller txn id
curl "https://<app>.onrender.com/api/webhooks/recent?token=<DEBUG_TOKEN>"   # (e) INVOICING.INVOICE.PAID verified:true ?
#   → get BUYER txn id: sandbox.paypal.com as buyer → Activity → payment → Transaction ID
npm run day1:dispute-create -- <BUYER_TXN_ID> 25.00 SNAD   # (f) Path A
#   if it fails once → Path B: as buyer in sandbox.paypal.com → Activity → payment → Report a problem / Resolution Center
npm run day1:dispute -- list        # find the dispute id
npm run day1:dispute -- show PP-D-XXXX    # (g) prints allowed actions + NEXT step; repeat per NEXT
curl ".../api/webhooks/recent?token=..."  # (h) CUSTOMER.DISPUTE.CREATED verified:true ?
npm run day1:dispute -- act PP-D-XXXX <action from NEXT>   # (i) drive to provide-evidence → adjudicate-seller
npm run day1:gemini                  # (j) structured output OK?
npm run day1:gemini -- PP-D-XXXX     # (k) tool calling OK?  → AGENT_MODE=tools or direct
```

Put a 1-page PDF at `server/scripts/day1/sample-evidence.pdf` before step (i) to test attachments.

### S1.3 Record results (paste into CLAUDE.md "Verified facts")

| Check | Result | Notes |
|---|---|---|
| Scopes include invoicing + disputes | ✅/❌ | |
| Invoice created/sent; pay link works | | |
| INVOICE.PAID webhook verified | | payload: `resource.invoice.id` or `resource.id`? (R1) |
| Seller txn id location | | `payments.transactions[].payment_id`? |
| Dispute created via API / manual | | which path worked |
| Dispute carries `invoice_number`? | | (R2) |
| Minutes until actions appeared | | |
| Path to provide_evidence | | e.g. escalate → require-evidence → provide-evidence |
| provide-evidence with PDF | | or notes-only |
| adjudicate → RESOLVED webhook | | outcome code |
| Gemini model name used | | |
| AGENT_MODE | tools / direct | |

### S1 Done when
All of (c)–(i) succeeded with real PayPal sandbox objects and webhooks show `verified:true`.

### S1 If it fails
- (b)/(e) webhooks don't arrive → check the webhook in Dashboard → *Apps → ProofPay → Webhooks* (events are per **app**); look at *Webhooks Events* in the dashboard for delivery status. Keep going; the poller will cover it.
- (f) both dispute paths fail → try ONE other transaction type: as buyer, **Send money** to the business email (PayPal's own test guide uses Send & Request) and dispute that. Works → our flow is still valid (map by amount+email for that case) — note it. Fails too → **7 Nov 12:00 decision: ExportReady**.
- (i) provide-evidence fails → once with no file (notes only) → still fails: `send-message` with the note, keep PDF in-app, record in BLOCKERS. Demo shows the case pipeline + adjudicate.
- (k) tool calling fails → `AGENT_MODE=direct`. Don't debug further today.

---

## S2 — App skeleton + deploy (B, 2 h) · F1 frontend skeleton (F, in parallel)

**B:** `server/src/{index,app,config}.js`, `db/connect.js`, `middleware/errorHandler.js`, `lib/{errors,log,money,canonical}.js`; move the Day-1 webhook route into `routes/webhooks.js` (same raw-body rule, now storing `WebhookEvent` in Mongo). `app.js` serves `web/dist` and falls back to `index.html` for non-`/api` paths. Switch Render to `render.yaml` (full app). Register a **new** PayPal webhook if the URL changed; update `PAYPAL_WEBHOOK_ID`.
**F (F1):** `npm create vite@latest web -- --template react` → Tailwind, React Router, `api.js`, `useApi`, layout shell, routes from LLD §11.2 with mock data. Vite dev proxy: `server: { proxy: { '/api': 'http://localhost:3000' } }`. AG Grid: install `ag-grid-community ag-grid-react`, register modules once in `main.jsx`:
```js
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
```
**Done when:** `GET https://<app>/api/health` → `{ok:true, db:true, paypalTokenOk:true}`; `https://<app>/` shows the React shell; a sandbox webhook lands in `webhookEvents` with `verified:true`.
**If it fails:** Render build "vite: not found" → build command must use `npm ci --include=dev --prefix web`. Blank page on deep links → missing SPA fallback route.

---

## S3 — Models, auth, projects, milestones (B, 3 h)

LLD §4 (models — copy), §6.1–6.3, §5.1 (state machine as `milestoneService.transition(m, event)` with a table, throwing `INVALID_STATE`). `scripts/seed.js` (LLD §14). Client link: `tokens.js` → `newClientToken()` (32 random bytes base64url), store `sha256`, link = `${APP_BASE_URL}/c/${token}`.
**Done when:** `node scripts/seed.js` then `curl` login + `GET /api/projects` returns seeded data; invalid transition returns 409.
**F (F2):** project + milestone screens on real API; (F3) client page on mock JSON shaped like `GET /api/client/project`.

---

## S4 — Approval → invoice → paid (B, 3 h)

LLD §6.4, §8.2 `invoiceService.issue`, §7 `onInvoicePaid`, §10 invoice poller. Snapshot hash per §6.4.
**Done when:** on prod, open the client link on a phone → Approve → within 10 s "Pay with PayPal" appears → pay as sandbox buyer → milestone PAID in < 1 min with `sellerTxnIds` filled. "Request changes" → no invoice.
**If it fails:** invoice create 4xx → playbook rows P3–P5. PAID not arriving → poller must catch it within 10 min; if the poller also fails, `getInvoice` status is the truth → fix parsing using the Day-1 recorded payload.

---

## S5 — Evidence collection + ledger (B, 3 h) · F4 evidence view (F)

LLD §8.5–8.6, §9 kinds. GitHub calls with the PAT; deploy check with SSRF guard (reject `localhost`, `127.*`, `10.*`, `172.16–31.*`, `192.168.*`, `169.254.*` after DNS lookup via `dns.promises.lookup`). Upload/note endpoints with multer limits.
**Done when:** delivering a milestone on the demo repo shows release + commits + deploy check as VERIFIED, a note as CLAIMED, and `GET /milestones/:id/evidence` returns `ledger.ok:true`. Editing a summary directly in Mongo makes `ledger.ok:false` (try it once; it's a video moment).
**If it fails:** GitHub 404 → release tag or repo name wrong (check `owner/repo`); 401 → PAT scope. Ledger duplicate key loop → max 3 attempts is in the design; if hit, appends are racing — serialise by awaiting collectors before appending.

---

## S6 — Dispute intake + mapping (B, 2 h)

LLD §7 `onDisputeEvent`, §8.8, §10 dispute poller, `routes/cases.js` GET/list/map/refresh.
**Done when:** a new sandbox dispute on a ProofPay invoice payment appears as a case within 60 s, mapped with `SELLER_TXN_ID` (or the method Day-1 showed works), milestone → DISPUTED; allowed actions listed.
**If it fails:** UNMAPPED → print `disputed_transactions` vs our `sellerTxnIds`; fix the extraction once using the Day-1 recorded payload; otherwise manual map is acceptable for the demo (it's a P0 UI path anyway).

---

## S7 — AI pipeline (B, 4 h)

LLD §9 (copy schemas, prompts, llm, policy, verifierRules, orchestrator; add `toolkit.js`, `contextAgent.js`, `caseService.analyse`). Evidence refs `E1…En`.
**Done when:** `POST /cases/:id/analyse` on the Day-1 style case returns READY with D1 table, decision + reasons, draft with citations, and at least the deterministic verifier active; `npm test` passes (9+ tests).
**If it fails:** schema errors from Gemini → playbook A2 (simplify schema / `structuredOutputs:false`) once; 429 → wait 60 s, then switch to a smaller/faster model in `GEMINI_MODEL`; any model failure leaves the case READY with `ai.error` (manual draft) — the demo must never block on the AI.
**F (F5):** case screen against a saved JSON of this response (save one from prod into `web/src/mocks/case.json`).

---

## S8 — Approval gate + submission + sandbox settle (B, 3 h)

LLD §6.5, §8.7 (`gate.js` is tested — copy), `caseService.submit`, sandbox routes, `onResolved` → `outcome.moneyProtectedCents` (= disputed amount if seller wins; amount kept if partial).
**Done when:** on prod: Approve → Submit → PayPal returns 200 → timeline shows request + debug id → "Simulate PayPal decision (sandbox)" (drives require-evidence/adjudicate as the dispute's links allow) → RESOLVED webhook → case RESOLVED, KPI updated. Editing after approval disables Submit.
**If it fails:** `NOT_ALLOWED_NOW` → follow the allowed actions (S1 path); 4xx on provide-evidence → playbook P11/P12 once, then S1 fallback.

---

## S9 — Evidence PDF + reminders (B, 2 h) — P1

LLD §8.10 (pdfkit), §8.9 (reminders via toolkit `send_invoice_reminder`), `ReminderSchema`.
**Done when:** PDF downloads and is attached on FIGHT submission; with `REMINDER_INTERVAL_MINUTES=2` an unpaid sandbox invoice gets an AI reminder visible on the invoice block (and in the sandbox invoice's history).
**If it fails:** pdfkit font issues → use built-in Helvetica only. Reminder tool error → call `remindInvoice()` (direct REST) once; note it.

---

## S10 — Judge access: Replay + case pool (B, 2 h) · F6 AG Grid dashboard (F)

`routes/demo.js` (`/demo/replay`, `/demo/reset`), fixtures from **real** recorded payloads (anonymise emails), `scripts/case-pool.js` (pays N invoices as buyer is manual; the script creates disputes for given buyer txn ids via Path A, else prints manual steps). README lists pool dispute IDs and which project they map to.
**F6:** Cases / Milestones / Evidence grids (LLD §11.3), KPI tiles from `/dashboard/summary`.
**Done when:** a fresh browser with only README info can (a) log in, (b) replay a dispute end to end, (c) take one pool case to RESOLVED.
**Feature freeze 10 Nov 22:00 IST.** After this only bug fixes, copy, polish.

---

## S11 — Tests, eval, README, hardening (B, 11 Nov)

- `npm test` green. `npm run eval` → paste the metrics table into README (LLD §13 fixture list).
- Security pass: `WEBHOOK_VERIFY=offline` on prod; helmet; rate limits; `.env` not in git history (`git log -p | grep -i secret` sanity check); judge creds are sandbox-only.
- README sections (A.11). Architecture image = export the HLD §3 mermaid.
- **F7:** record with real prod data (seed fresh), voice-over, captions, < 2:55; upload public to YouTube.
**Done when:** 3 full dry runs on prod pass the A.10 script.

---

## S12 — Submit (B+F, 12 Nov, aim 18:00–21:00 IST)

Devpost form (one representative submits), repo URL, video URL, hosted URL, description (+ "AI tools used and how"), category checkboxes (Best Use of PayPal + AI; AG Grid). Screenshot the confirmation. **Do not redeploy breaking changes after submitting**; keep Render + Atlas + AG Grid trial alive until 15 Dec.

---

## B.10 Known-errors playbook (apply the fix ONCE; then the step's fallback)

| # | Symptom | Likely cause | Fix |
|---|---|---|---|
| P1 | OAuth `invalid_client` | Live creds used with sandbox URL, or stray space in secret | Use **Sandbox** tab credentials; re-copy |
| P2 | 401/403 on invoicing or disputes | Feature not enabled on the app / wrong account | `day1:env` scopes; enable feature in app settings; new token after ~1 min |
| P3 | Invoice create `DUPLICATE_INVOICE_NUMBER` | Reused number | Increment attempt suffix (`-2`) |
| P4 | Invoice create 4xx mentioning invoicer email/`USER_NOT_FOUND` | `invoicer.email_address` ≠ API account | Remove `invoicer.email_address` (our builder already does) |
| P5 | Create returns no `id` | No `Prefer: return=representation` | Handled: we parse the self link |
| P6 | Buyer can't pay ("can't pay yourself") | Logged in as the business account | Incognito window, sandbox **Personal** login |
| P7 | No email received | Sandbox doesn't email real inboxes | Use the payer link from the script / client page |
| P8 | Webhook never arrives | Registered on another app/URL; service down | Dashboard → Webhooks Events; re-run `day1:webhook`; poller covers it |
| P9 | Webhook `verified:false` | Wrong `PAYPAL_WEBHOOK_ID` for this URL; JSON parsed before raw; dashboard *simulated* event | Fix id; webhook route before `express.json()`; ignore simulator results; try `WEBHOOK_VERIFY=online` once |
| P10 | Dispute create 401/403/`PERMISSION_DENIED` | API path not allowed for this app | Path B (manual in sandbox UI) — don't retry |
| P11 | provide-evidence 422 / action not allowed | Wrong status (needs `WAITING_FOR_SELLER_RESPONSE`) | `show` → follow NEXT (escalate → require-evidence) |
| P12 | provide-evidence 400 on multipart/doc | File/part naming or type | Retry once **notes-only**; then `send-message` fallback |
| P13 | adjudicate 422 | Status not `UNDER_REVIEW` / no `adjudicate` link | `show`; after evidence the status should become UNDER_REVIEW; else escalate |
| P14 | make-offer 422 | Not in inquiry stage | Use `accept-claim` `PARTIAL_REFUND` |
| P15 | accept-claim / offer: insufficient funds | Sandbox business balance 0 | Add balance to the business sandbox account (Sandbox Accounts → edit) |
| P16 | `Named export 'PayPalAgentToolkit' not found` | ESM/CJS interop | `import pkg from '@paypal/agent-toolkit/ai-sdk'; const { PayPalAgentToolkit } = pkg;` |
| P17 | Errors mentioning `inputSchema`, `LanguageModelV2/V3`, `specificationVersion` | `ai` got upgraded past v4 | `npm ls ai` → reinstall pinned `ai@4.3.19 @ai-sdk/google@1.2.22` |
| P18 | Gemini 404 model | Wrong/retired model name (Gemini 2.5 was shut down Oct 2026) | Set `GEMINI_MODEL` to a name your key lists |
| P19 | Gemini schema 400 ("unsupported"/"invalid JSON payload") | Schema too complex | Flatten schema; or `google(name, { structuredOutputs: false })` |
| P20 | Gemini multi-step tool call 400 (thought signature / function response) | Gemini 3 + AI SDK v4 | `AGENT_MODE=direct` |
| P21 | Gemini 429 | Rate limit | Wait 60 s; fewer calls; cache results on the case |
| P22 | `zlib.crc32 is not a function` | Node < 22.2 | `NODE_VERSION=22.12.0` on Render; `node -v` locally |
| P23 | `node --test test/` can't find files | Node 22 wants files/globs | `npm test` (uses the glob) |
| P24 | Atlas timeout from Render | Network allowlist or DB credentials | Check the current Render service outbound CIDRs in **Connect → Outbound**, allowlist those in Atlas, then verify the DB user and encoded URI. Avoid a permanent `0.0.0.0/0` rule. |
| P25 | AG Grid error #272 / grid empty | Modules not registered / container has no height | `ModuleRegistry.registerModules([AllCommunityModule])`; give the grid wrapper a fixed height |
| P26 | AG Grid theme warning / unstyled | Mixing legacy CSS with the Theming API | Use the default theme (`themeQuartz`) and don't import legacy CSS, or set `theme="legacy"` consistently |
| P27 | Render build `vite: not found` | devDependencies skipped | `npm ci --include=dev --prefix web` |
| P28 | Cookies not sent in dev | Different origins | Use the Vite proxy; `secure` cookie only in production |
| P29 | `import.meta.env.X` undefined | Not prefixed | Must start with `VITE_`; rebuild |
| P30 | Express `req.body` empty / Buffer in other routes | Raw middleware applied globally | Only the webhook route uses `express.raw` |

---

## B.11 Final dry-run checklist (11 Nov, on prod, fresh seed)

- [ ] Login with README creds
- [ ] Create milestone → deliver → evidence VERIFIED/CLAIMED → ledger OK
- [ ] Client link on a phone → approve → pay as buyer → PAID < 1 min
- [ ] New dispute (pool or fresh) → case < 60 s → AI → approve → submit 200 → simulate decision → RESOLVED
- [ ] Edit after approval blocks submit
- [ ] Replay mode works in an incognito browser
- [ ] AG Grid dashboard numbers match cases
- [ ] `npm test` green, eval table in README
- [ ] Video < 3:00 public; Devpost text has AI-tools section
