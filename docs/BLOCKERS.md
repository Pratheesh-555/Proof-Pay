# Submission readiness

Updated 2026-11-11.

## Complete

- PayPal Sandbox OAuth and invoicing, disputes, and webhook scopes work.
- A Sandbox invoice was sent and paid with the Sandbox Personal account.
- The buyer-created Sandbox dispute was imported, mapped to project work, analyzed, reviewed by a person, and submitted through a PayPal-allowed action. PayPal later reported **RESOLVED**. This is only the Sandbox test outcome.
- Gemini structured generation works in the direct server-side workflow. The optional Agent Toolkit function-calling experiment is not used because of a provider `thought_signature` error.
- MongoDB Atlas connected from the hosted app; the idempotent seed created the public demo user, Sandbox project, and DRAFT milestone.
- The public Render app loaded, its database health check passed, and the demo account signed in.
- PayPal Sandbox webhook verification is enabled on the hosted app.
- The public GitHub repository is MIT licensed and contains setup instructions.
- This final hardening pass adds a filtered-claims review UI, invalidates old approvals when analysis or mapping changes, includes retained claims in the approval hash, and refreshes PayPal actions immediately before submission.

## Remaining user action

Record and upload the demo video (under three minutes) to YouTube, paste its public link into the Devpost entry, and submit. The written submission and recording outline are in `docs/DEVPOST_SUBMISSION.md`. Devpost requires a working demo, public source repository, description of tools used, and a public YouTube video.

The deployed demo runs on Render Free and may need about a minute to wake after inactivity. Public demo credentials are intentionally disposable and are documented in the README and submission pack.

## Limits to disclose

- PayPal controls dispute status, available actions, and the final outcome. ProofPay does not adjudicate disputes.
- The Sandbox test case resolved; this does not show that ProofPay can cause a real case to be won.
- Supporting-info submission sends a text note. The full supporting-file upload flow is not implemented.
- GitHub release/commit and deploy URL evidence connectors, background reminder delivery, and full evidence upload remain future work.
- The working AI path uses Gemini structured generation. The optional Agent Toolkit tool-calling path is not part of the demo.
- Render Free sleeps when idle; allow for a cold start.
