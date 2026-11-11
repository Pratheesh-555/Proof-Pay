# ProofPay

**ProofPay helps freelancers agree on work, record client approval, invoice through PayPal, and prepare evidence-backed responses to payment disputes.** AI can organize evidence and draft a response; a person must review and approve before anything is sent to PayPal.

> This project is configured for PayPal Sandbox. It is a hackathon prototype, not a production payment or legal service.

## What works

- Email/password freelancer login with an HTTP-only session cookie.
- Projects, clients, milestones, private expiring client review links, approval and change-request capture.
- PayPal Sandbox invoice creation and payment webhook handling.
- Evidence ledger with source and trust labels.
- PayPal dispute import, mapping to a milestone, AI assessment and response draft, human approval gate, and allowed-action submission.
- Gemini structured output. The optional PayPal Agent Toolkit tool-calling path is not required by the direct API workflow.
- MongoDB persistence and a repeatable demo seed command.

The deployed Sandbox flow has been exercised end to end: a Sandbox invoice was paid, the resulting dispute was imported and mapped, AI analysis ran, a human approved an allowed response, and PayPal later reported the case as **RESOLVED**. This is a Sandbox demonstration, not a claim about a live customer dispute or proof that ProofPay can control PayPal's adjudication outcome. The hosted demo runs on Render Free and can take about a minute to wake after inactivity.

## Stack

- Node.js 22+, Express, MongoDB/Mongoose
- React 18, Vite, Tailwind CSS, React Router, AG Grid Community
- PayPal Sandbox REST APIs: Invoicing, Disputes, and Webhooks
- Gemini structured generation

## Run locally

1. Install Node.js 22 or later and MongoDB Atlas (or a local MongoDB instance).
2. Copy `server/.env.example` to `server/.env`. Fill in the MongoDB URI, PayPal Sandbox business app credentials, Sandbox Personal buyer email, and Gemini API key. Keep `.env` private; never commit it.
3. Install both apps:

   ```bash
   npm install --prefix server
   npm install --prefix web
   ```

4. Seed a demo freelancer, a clearly labeled Sandbox project, and a DRAFT milestone:

   ```bash
   npm run seed --prefix server
   ```

   The seed is safe to re-run. It does not create fake payment or delivery evidence.

5. In one terminal start the API:

   ```bash
   npm run dev --prefix server
   ```

6. In another terminal start the frontend:

   ```bash
   npm run dev --prefix web
   ```

7. Open `http://localhost:5173` and sign in using `SEED_FREELANCER_EMAIL` and `SEED_FREELANCER_PASSWORD` from your private `.env`.

For the public hackathon demo, use **demo@proofpay.dev** / **ProofPay-Demo-2026!**. These are intentionally public credentials for a disposable Sandbox demo account. Set the same values in the hosting environment before running the seed command.

The local environment defaults to webhook verification `off` for development only. To exercise real webhooks, register the public callback `https://YOUR-HOST/api/webhooks/paypal` in the PayPal Sandbox app, set its returned webhook ID, and use `WEBHOOK_VERIFY=online`. Production configuration rejects `WEBHOOK_VERIFY=off`.

## Import the Sandbox dispute

1. In the signed-in app, open **Dispute cases** and choose **Import from PayPal**.
2. Paste the actual Sandbox dispute ID.
3. If the dispute does not map automatically, map it to the Sandbox validation milestone.
4. Run analysis. Review the source and trust labels, edit the response if needed, and use **Approve response** only when the wording is accurate.
5. Submit only when the action is currently allowed by PayPal. PayPal controls the case status and available actions; a case under review may have no action available.

Never claim service delivery or attach evidence that does not exist. The AI recommendation is not legal advice and is not sent without human approval.

## Environment variables

See [`server/.env.example`](server/.env.example) for the complete list. Required values include MongoDB URI, session/link secrets, demo login, PayPal Sandbox credentials and webhook ID, Gemini API key, and app base URL. Use strong unique secrets on a hosted deployment. Set `APP_BASE_URL` to the deployed app origin so client review links point to the right host.

For Render, use [`render.yaml`](render.yaml) as the service blueprint and enter each secret in Render's environment settings. The blueprint uses Render Free, enables the idempotent demo seed at app startup, and sets `WEBHOOK_VERIFY=online`; use the webhook ID created for the deployed callback. Free services sleep after 15 minutes without traffic and may take about a minute to wake, so tell judges to allow a cold start. Render Free has no one-off jobs or shell access, so the demo seed runs automatically when the app starts. See Render's [Free instance limits](https://render.com/docs/free).

## Security and demo boundaries

- Sandbox only; no live PayPal credentials.
- Case routes are scoped to the signed-in freelancer's workspace.
- Public client approval links use a hash at rest and expire after 30 days.
- Webhook callbacks verify the PayPal signature before processing.
- AI output is advisory. Draft edits clear prior approval, and the final submission is gated by a hash of the approved response.
- Public demo credentials are intentionally only for the disposable hackathon demo. Change them before any real use.
- Render Free is for prototypes and hobby projects, not production. The app uses MongoDB Atlas and PayPal/Gemini external APIs; unusual outbound traffic may trigger Render's free-service restrictions.

## Hackathon submission

The repository is MIT licensed. The deployed demo URL is `https://proofpay-kvc2.onrender.com`; public Sandbox demo login is `demo@proofpay.dev` / `ProofPay-Demo-2026!`. The Devpost text, tool descriptions, limitations, and a sub-three-minute recording outline are in [`docs/DEVPOST_SUBMISSION.md`](docs/DEVPOST_SUBMISSION.md). Add the public YouTube demo-video link in Devpost before submitting. The PayPal case used for the walkthrough is resolved in Sandbox; PayPal remains responsible for deciding real disputes.

See [`docs/SYSTEM_OVERVIEW.md`](docs/SYSTEM_OVERVIEW.md) for the frontend/backend architecture and workflow.
See [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for the as-built feature list, remaining product gaps, and public-repository/data-exposure review.

## License

MIT. See [LICENSE](LICENSE).
