# Submission readiness and remaining blockers

Updated 2026-11-11.

## Verified

- PayPal Sandbox OAuth token works and the app has invoicing, disputes, and webhook scopes.
- A Sandbox invoice was sent and paid with the Sandbox Personal account.
- The buyer-created Sandbox dispute was escalated and entered PayPal review. It currently appears as **UNDER REVIEW**; it has not been resolved.
- Gemini structured generation returned a valid assessment. The optional Agent Toolkit function-calling path failed on a missing `thought_signature`; the app uses structured generation and directly orchestrated API calls instead.
- MongoDB Atlas connected successfully from the app runner; the idempotent seed created the public demo user, Sandbox project, and DRAFT milestone.
- Local Express health check returned `ok: true`, `db: true`, and the production-built frontend returned HTTP 200.
- Frontend production build succeeds. Backend unit tests: 8 passed.

## Still required before portal submission

1. Publish the repository to the supplied GitHub repo and make sure it is public with the MIT license.
2. Create the Render service from `render.yaml`, set its environment values (including public `APP_BASE_URL`, Atlas URI, demo credentials, PayPal Sandbox credentials, Gemini key, and the deployment's webhook ID), and deploy.
3. Register `https://YOUR-HOST/api/webhooks/paypal` in the Sandbox PayPal app. Set `PAYPAL_WEBHOOK_ID` and `WEBHOOK_VERIFY=online` in Render.
4. Open the hosted app in a private browser session with the public demo login; verify login, project/milestone seed, and the dispute screen. The sandbox case can remain under review; do not imply an outcome.
5. Record and upload the public demo video (under three minutes) and complete the portal fields, then submit.

Items 1, 2, 3, and 5 require access to the user's GitHub, Render, PayPal Developer, and Devpost sessions. The repository work and Atlas seed are done.

## Known limits

- PayPal controls dispute status and allowed actions. A Sandbox case in review can offer no action at that moment.
- Supporting-info submission sends a text note. File upload and broader delivery-source integrations are not in this hackathon build.
- The GitHub release/commit and deployed-URL evidence connectors, background reminder delivery, and full evidence upload flow remain follow-up work; do not describe them as completed.
- The optional PayPal Agent Toolkit tool-calling path is not used because of the model-provider `thought_signature` error; the direct structured-generation workflow works.
- The frontend bundle still includes a large AG Grid chunk; the dashboard is lazy-loaded so non-dashboard routes do not need it immediately.
