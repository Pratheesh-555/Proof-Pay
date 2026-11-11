# ProofPay — Devpost submission pack

Use this as the source text for the Devpost form. Only the YouTube video URL remains to be added after recording and uploading the demo.

## Project name

ProofPay

## Tagline

From agreed milestone to PayPal dispute response, with an evidence trail and a human approval gate.

## Short description

ProofPay helps independent freelancers track project milestones, collect client approval, invoice through PayPal, and prepare evidence-linked responses when a payment is disputed. AI organizes the case; the freelancer reviews and approves every response before it is sent.

## Inspiration

Freelancers often manage a project in one place, approval in another, invoices in PayPal, and dispute records somewhere else. When a client challenges a payment, reconstructing what was agreed, delivered, approved, and paid takes time—and an unsupported statement can hurt the case. ProofPay connects that timeline around each milestone.

## What it does

1. A freelancer creates a project, defines milestone scope and acceptance criteria, then shares a private review link with the client.
2. The client can approve the milestone or request changes. ProofPay records the decision in the project timeline.
3. The freelancer creates and sends a PayPal Sandbox invoice for the milestone. PayPal webhooks update payment state.
4. When a dispute arrives, ProofPay imports it, maps it to project work, and assembles the available evidence and payment context.
5. Gemini produces a structured assessment and response draft. Deterministic checks remove claims with missing or invalid evidence references, and the interface presents retained claims separately from filtered output.
6. The freelancer edits and approves the response. ProofPay checks the current PayPal actions again immediately before sending, then records the action and later status updates.

The AI is an assistant, not an autonomous dispute agent: it cannot submit a response without explicit human approval.

## What is new about it

PayPal already provides invoice and dispute APIs. ProofPay's contribution is the freelancer workflow around those APIs: it ties milestone scope, client review, invoice/payment events, and dispute response preparation to one evidence trail. It adds a practical guardrail for AI-generated dispute text: statements must point to evidence records, unsupported references are filtered, and a person approves the exact response before the app calls PayPal. It is a workflow and safety layer, not a replacement for PayPal's dispute system or adjudication.

## How we built it

- **Frontend:** React, Vite, Tailwind CSS, React Router, AG Grid Community.
- **Backend:** Node.js 22, Express, Mongoose, MongoDB Atlas.
- **Payments:** PayPal Sandbox Invoicing, Disputes, and verified webhooks.
- **AI:** Gemini structured generation for criterion assessment, action strategy, and draft response; deterministic evidence-reference checks and application policy rules constrain the output.
- **Hosting:** Render Free web service; MongoDB Atlas persistence.

The server owns PayPal credentials and API calls. The browser never receives the PayPal client secret. The case approval gate hashes the draft and decision; edits invalidate approval. Before any case action, the server fetches the dispute again and checks PayPal's currently allowed actions.

## Challenges we ran into

- PayPal Sandbox limitations and account-region behavior made invoice testing less straightforward than a normal local checkout. We used Sandbox accounts and verified the invoice and dispute flow without using live funds.
- A Mongoose schema field named `type` caused nested timeline events to be interpreted incorrectly. We changed it to `eventType` and corrected the hosted dispute import path.
- The hosted service sits behind a proxy, so the production Express trust-proxy setting needed to be configured for rate limiting.
- AI can produce fluent but unsupported statements. We added reference validation, filtering, an explicit human approval step, and a fresh PayPal action check at submission time.
- Render Free sleeps when idle, so the public demo may need about a minute to wake.

## Accomplishments

- Deployed a working public Sandbox demo with MongoDB persistence.
- Exercised the complete Sandbox story: invoice payment, dispute import and milestone mapping, AI analysis, human-approved response submission, and PayPal's later `RESOLVED` status.
- Built an end-to-end workflow spanning work agreements, client approval, payment, and dispute handling.
- Kept dispute responses under human control and prevented stale approvals from surviving draft changes or new analyses.

## What we learned

Payment safety depends on more than a successful API call. The surrounding record needs to show where a statement came from, whether the customer approved the work, what PayPal currently allows, and which person approved the final response. We also learned to keep Sandbox outcomes clearly labeled and avoid presenting AI output as proof.

## What's next

Production readiness would require stronger operational monitoring, additional integration and failure testing, a real evidence-file upload flow, richer GitHub/deployment evidence ingestion, and a paid always-on hosting setup. The current hosted app is a hackathon prototype using PayPal Sandbox, Render Free, and public demo credentials; it is not suitable for live payments or real dispute management.

## Tools and AI use

- **PayPal Sandbox:** invoice creation and sending, dispute retrieval and actions, webhook signature verification, and status updates.
- **Gemini (`gemini-3.5-flash-lite`):** structured assessment of milestone criteria, response strategy, and draft claims. Application code validates cited evidence references, applies policy limits, and requires human approval before PayPal submission.
- **AG Grid Community:** used in the application dashboard to present project and payment records.
- **Render:** hosts the public web application and API; the deployment uses Render Free, so it may cold-start after inactivity.
- **MongoDB Atlas:** stores projects, milestones, invoices, evidence references, and dispute workflow state.

The optional PayPal Agent Toolkit tool-calling experiment was not used in the working submission flow; the live workflow calls the server-side PayPal API client directly and uses Gemini for structured generation.

## Links

- **Live demo:** https://proofpay-kvc2.onrender.com
- **Public repository:** https://github.com/Pratheesh-555/Proof-Pay
- **Demo login:** `demo@proofpay.dev` / `ProofPay-Demo-2026!`
- **Demo video:** _Add the public YouTube URL after recording._

## Sponsor prize fit

- **AG Grid:** the app uses AG Grid Community in its dashboard. The hackathon rules list submissions using AG Grid tools as eligible for the AG Grid sponsor prizes. The separate AG Studio showcase describes a more advanced target; do not claim AG Studio features.
- **Render:** the working public app is deployed on Render, matching the Render-tools sponsor eligibility language. Describe the actual deployment and Free-tier cold start; do not claim Render credits or a prize.
- The app does not use APIMatic, Astropods, Bryntum, Channel3, Elastic, KERNEL, Postman, or Zapier. Do not select those sponsor awards.

## Recording outline (under 3 minutes)

Aim for roughly 2:30. Keep the actual app visible while narrating; do not use copyrighted music. The official submission requires a publicly visible YouTube video under three minutes.

- **0:00–0:20 — Problem:** “Freelancers have project scope, approvals, invoices, and disputes scattered across tools. ProofPay connects that trail so a dispute response can be grounded in the project record.”
- **0:20–0:55 — Project setup:** Sign in to the public demo. Show the seeded project and its milestone scope/acceptance criteria. Explain that the client review link captures approval or change requests.
- **0:55–1:20 — PayPal payment:** Show the invoice/payment record in the demo. Say this integration uses PayPal Sandbox; do not expose secrets or claim a live transaction.
- **1:20–1:55 — Dispute and AI:** Open the resolved Sandbox case. Show the dispute mapped to its milestone, the assessment, linked evidence area, and filtered-claims panel. Explain that evidence references are checked and unsupported AI text is not presented as an approved claim.
- **1:55–2:20 — Human and PayPal guardrails:** Show the saved response note, case timeline, and resolved Sandbox status. Explain that, while a dispute is actionable, editing clears approval and the server refreshes PayPal's allowed actions immediately before submission. Do not imply this already-resolved case is still actionable, or resubmit/alter it for the recording.
- **2:20–2:35 — Close:** “ProofPay does not decide disputes. It helps freelancers carry project context into PayPal's existing process, with a human approving every response.”

Before recording, verify the seeded demo account still signs in, allow for Render cold start, and avoid showing secrets, personal email, or unrelated browser tabs. The real test dispute is already resolved; use its existing read-only case view and do not trigger another action.
