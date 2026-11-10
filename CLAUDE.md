# ProofPay project memory

Last updated: 2026-11-11. Keep this file aligned with `README.md` and `docs/BLOCKERS.md`.

## Project

ProofPay is a PayPal AI Hackathon prototype for freelancers. It connects client approval to PayPal invoicing, records evidence provenance, and prepares human-reviewed dispute replies. **PayPal Sandbox only.** It is not a production payment or legal service.

## Architecture

- `web/`: React 18, Vite, Tailwind, React Router, AG Grid Community.
- `server/src/routes/`: Express API, authentication, validation, workspace ownership checks, PayPal webhook route.
- `server/src/services/`: projects, client review links, milestone states, invoices, evidence ledger, dispute mapping, AI workflow and human approval gate.
- `server/src/payments/paypal/`: PayPal REST calls, invoicing, disputes, webhook signature verification.
- `server/src/ai/`: Gemini structured generation, policy checks, evidence-claim verification.
- `server/src/db/`: MongoDB connection and Mongoose models.
- Production uses one Render Node web service to serve the API and `web/dist`; MongoDB Atlas stores app data.

## Current verified state

- User completed Sandbox app setup, invoice create/send/payment, and buyer-side dispute creation/escalation. PayPal lists the test dispute as **UNDER REVIEW**, not resolved.
- PayPal Sandbox OAuth and invoicing/disputes/webhook scopes worked. Gemini structured generation worked with `gemini-3.5-flash-lite`.
- The optional PayPal Agent Toolkit function-calling path failed due to a missing `thought_signature`; the direct structured-generation workflow is used.
- Atlas connection and `npm run seed --prefix server` succeeded. Seed data contains a public demo login, a Sandbox project, and a $5 DRAFT milestone; no fake payment or service-delivery evidence.
- Local app booted, Atlas health was `db: true`, app HTML returned HTTP 200. Frontend build succeeds; backend tests pass.
- Hackathon deployment, hosted PayPal webhook registration, final hosted UI click-through, demo video, and portal submission are still pending.

## Safety and product rules

- Never switch PayPal to live credentials.
- Keep `.env` out of Git. Do not print credentials, Atlas URI, or API keys.
- Mark evidence `CLAIMED` when seller-entered; use `VERIFIED` only when captured through a trusted connected flow or client action.
- AI is advisory. Humans approve the final note, action, refund amount, and evidence references. Any edit clears approval; submission requires the current approval hash.
- Available dispute actions come from PayPal's HATEOAS links. PayPal decides case status and outcome.
- Do not call a Sandbox dispute won or resolved unless PayPal reports that status.

## Commands

- `npm run dev --prefix server`
- `npm run dev --prefix web`
- `npm run seed --prefix server`
- `npm run db:check --prefix server`
- `npm test --prefix server`
- `npm run build --prefix web`

Use `render.yaml` for full-app hosting. Set `WEBHOOK_VERIFY=online` and register the deployed callback before relying on webhooks. See `README.md`, `docs/SYSTEM_OVERVIEW.md`, and `docs/BLOCKERS.md`.
