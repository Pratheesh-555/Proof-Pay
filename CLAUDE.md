# ProofPay project memory

Last updated: 2026-11-11. `docs/IMPLEMENTATION_STATUS.md` is the current as-built scope reference; keep this file aligned with it and `README.md`.

## Project

ProofPay is a PayPal AI Hackathon prototype for freelancers. It connects client approval to PayPal invoicing, records evidence provenance, and prepares human-reviewed dispute replies. **PayPal Sandbox only.** It is not a production payment or legal service.

## Architecture

- `web/`: React 18, Vite, Tailwind, React Router, AG Grid Community.
- `server/src/routes/`: Express API, authentication, validation, workspace ownership checks, PayPal webhook route.
- `server/src/services/`: projects, client review links, milestone states, invoices, evidence ledger, dispute mapping, AI workflow and human approval gate. The scheduled polling/reminder jobs currently log pending markers; they are not implemented workers.
- `server/src/payments/paypal/`: PayPal REST calls, invoicing, disputes, webhook signature verification.
- `server/src/ai/`: Gemini structured generation, policy checks, deterministic evidence-reference checks. PayPal Agent Toolkit tool calling is not in the working flow.
- `server/src/db/`: MongoDB connection and Mongoose models.
- Production uses one Render Node web service to serve the API and `web/dist`; MongoDB Atlas stores app data.
- `render.yaml` uses Render Free and enables idempotent seed-on-start because Free has no shell or one-off jobs. It sleeps after 15 idle minutes and can take about a minute to wake.

## Current verified state

- User completed Sandbox app setup, invoice create/send/payment, and buyer-side dispute creation/escalation. The dispute response was submitted through ProofPay and PayPal later reported the test dispute as **RESOLVED**. Sandbox only; this is not a real customer case or a guaranteed result.
- PayPal Sandbox OAuth and invoicing/disputes/webhook scopes worked. Gemini structured generation worked with `gemini-3.5-flash-lite`.
- The optional PayPal Agent Toolkit function-calling path failed due to a missing `thought_signature`; the direct structured-generation workflow is used.
- Atlas connection and idempotent seed succeeded. Seed data contains a public demo login, a Sandbox project, and a $5 DRAFT milestone; no fake payment or service-delivery evidence.
- Hosted app health returned `db: true`; public UI and database-backed login were confirmed. PayPal Sandbox webhook verification is enabled.
- Backend tests passed 11/11; frontend production build succeeds. The latest public `main` build was verified healthy after deployment.
- The remaining entrant tasks are recording/uploading the public under-three-minute YouTube demo and completing/submitting the Devpost form.

## Safety and product rules

- Never switch PayPal to live credentials.
- Keep `.env` out of Git. Do not print credentials, Atlas URI, or API keys.
- Mark evidence `CLAIMED` when seller-entered; use `VERIFIED` only when captured through a trusted connected flow or client action.
- AI is advisory. Humans approve the final note, action, refund amount, and evidence references. Any edit clears approval; submission requires the current approval hash.
- Available dispute actions come from PayPal's HATEOAS links. PayPal decides case status and outcome.
- Do not call a Sandbox dispute won or resolved unless PayPal reports that status.
- Do not claim GitHub/deploy evidence connectors, file uploads, PDFs, replay/case-pool mode, automatic reminders, or automatic polling as working; see `docs/IMPLEMENTATION_STATUS.md`.

## Commands

- `npm run dev --prefix server`
- `npm run dev --prefix web`
- `npm run seed --prefix server`
- `npm run db:check --prefix server`
- `npm test --prefix server`
- `npm run build --prefix web`

Use `render.yaml` for full-app hosting. Set `WEBHOOK_VERIFY=online` and register the deployed callback before relying on webhooks. See `README.md`, `docs/SYSTEM_OVERVIEW.md`, and `docs/BLOCKERS.md`.
