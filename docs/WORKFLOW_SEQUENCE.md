# ProofPay user and payment sequence

This diagram follows the implemented Sandbox path. Solid arrows are user or system actions. The `alt` blocks show important branches and safe stops. Gemini drafts; the freelancer approves; PayPal controls payment and dispute outcomes.

```mermaid
sequenceDiagram
    autonumber
    actor F as Freelancer
    participant P as ProofPay app/API
    participant DB as MongoDB Atlas
    actor C as Client
    participant PP as PayPal Sandbox
    participant AI as Gemini

    F->>P: Create project and milestone (scope, criteria, amount)
    P->>DB: Save project and DRAFT milestone
    F->>P: Mark delivered; enter delivery note
    P->>DB: Save note as CLAIMED evidence; update milestone
    P-->>C: Provide private review link
    C->>P: Open link and review delivered milestone

    alt Client requests changes
        C->>P: Submit change request
        P->>DB: Save client action as VERIFIED; set CHANGES_REQUESTED
        P-->>F: Show requested changes; do not create an invoice
        F->>P: Revise work and mark it delivered again
        P->>DB: Append a new CLAIMED delivery note
        P-->>C: Show updated milestone on the review link
    else Client approves
        C->>P: Confirm approval and enter name
        P->>DB: Save VERIFIED client approval; set APPROVED
        P->>PP: Create and send PayPal invoice
        alt PayPal invoice request fails
            PP-->>P: Return API error
            P->>DB: Store invoice ERROR and PayPal error details
            P-->>F: Show error; freelancer can retry
        else PayPal invoice sent
            PP-->>P: Return invoice and payer link
            P->>DB: Store SENT invoice and verified invoice evidence
            P-->>C: Show PayPal payment link
            opt Client pays
                C->>PP: Pay invoice
                PP-->>P: Send INVOICING.INVOICE.PAID webhook
                P->>P: Verify webhook signature and deduplicate event
                alt Invalid signature
                    P-->>PP: Reject event; do not record payment
                else Duplicate event
                    P-->>PP: Acknowledge duplicate; do not process twice
                else Valid, new event
                    P->>PP: Fetch invoice details
                    alt Invoice lookup succeeds
                        PP-->>P: Return payment status and transaction IDs
                        P->>DB: Mark PAID; append verified payment evidence
                    else Invoice lookup or processing fails
                        P->>DB: Keep webhook event and record processing error
                        Note over F,P: No automatic webhook replay worker; refresh/import or operator recovery is needed.
                    end
                end
            end
        end
    end

    Note over C,PP: If the invoice stays unpaid, it remains SENT. Automatic reminders and polling are not implemented.

    alt PayPal sends dispute webhook
        PP-->>P: CUSTOMER.DISPUTE.CREATED event
        P->>P: Verify webhook signature and deduplicate event
        alt Invalid signature
            P-->>PP: Reject event; do not create/update case
        else Duplicate event
            P-->>PP: Acknowledge duplicate; do not process twice
        else Valid, new event
            P->>PP: Fetch full dispute and current action links
            alt Dispute lookup succeeds
                PP-->>P: Return dispute details and allowed actions
            else Dispute lookup or processing fails
                P->>DB: Keep webhook event and record processing error
                Note over F,P: No automatic webhook replay worker; refresh or manually import the case.
            end
        end
    else Freelancer imports dispute manually
        F->>P: Import using the Sandbox dispute ID
        P->>PP: Fetch full dispute and current action links
        alt Dispute lookup succeeds
            PP-->>P: Return dispute details and allowed actions
        else Dispute lookup fails
            P-->>F: Show import error; no new case is created
        end
    end
    P->>DB: Save dispute; try transaction-ID/invoice-number mapping
    Note over F,P: A verified new dispute-creation webhook may start analysis after automatic mapping; manual import or mapping requires the freelancer to run it.

    alt Invoice maps to a milestone
        P->>DB: Link dispute to its project and milestone
    else No reliable match
        P-->>F: Mark UNMAPPED; request a milestone choice
        F->>P: Select the related milestone
        P->>DB: Save human-confirmed mapping; clear any old draft/approval
    end

    alt Case is mapped
    F->>P: Run analysis if it has not already auto-run
    P->>DB: Clear prior decision and approval; load milestone/evidence
    P->>AI: Request structured assessment, strategy, and response draft
    alt Gemini succeeds
        AI-->>P: Return assessment and draft claims with evidence refs
        P->>P: Remove claims with missing/unknown refs; apply policy and refund cap
        opt Claims remain after basic checks
            P->>AI: Ask verifier to assess support for each cited claim
            AI-->>P: Return support verdicts, or verifier error
            P->>P: Remove claims explicitly marked unsupported
        end
        P-->>F: Show assessment, retained claims, filtered claims, and editable note
    else Gemini unavailable or returns invalid output
        AI-->>P: Return error
        P-->>F: Show analysis error; require a human-written note/action
    end

    F->>P: Edit response or action
    P->>DB: Save edits and clear prior approval
    F->>P: Approve the exact response
    P->>P: Require action + nonempty note; recheck partial-refund cap; hash approved draft
    P->>DB: Store human approval and approved draft hash
    F->>P: Submit response
    P->>P: Verify approval hash; fetch dispute again from PayPal
    P->>PP: GET latest status and allowed-action links
    PP-->>P: Return current dispute state

    alt Dispute resolved, no action available, or chosen action is stale
        P->>DB: Save refreshed PayPal state; block submission
        P-->>F: Explain; wait or refresh/review the newly allowed actions
    else Current action is allowed
        alt FIGHT
            P->>PP: Submit supporting info/evidence notes
        else PARTIAL_REFUND
            P->>P: Enforce project refund cap
            P->>PP: Make offer or accept partial refund, per allowed links
        else ACCEPT
            P->>PP: Accept claim and refund, if allowed
        end
        alt PayPal accepts the action
            PP-->>P: Return successful action response
            P->>DB: Record submission and wait for PayPal status
            PP-->>P: Later send resolution webhook, or status is refreshed manually
            P->>DB: Store PayPal's reported outcome/status
            P-->>F: Show PayPal's outcome; ProofPay does not decide the case
        else PayPal rejects action or request fails
            PP-->>P: Return API/network error
            P-->>F: Show error; no success is claimed; refresh case and review before retrying
        end
    end
    end
```

## Guardrails to keep in mind

- Delivery notes typed by the freelancer are `CLAIMED`; client approval and PayPal invoice/payment events are captured as `VERIFIED` records.
- Citation checks confirm that references exist and are allowed; they do not independently prove that a service was performed. The freelancer must review factual statements.
- Editing or rerunning analysis clears the previous approval. A partial refund is checked against the project cap again when approved.
- The server refreshes PayPal's state immediately before submitting. A resolved case or unavailable action is blocked rather than sent.
- PayPal API or webhook processing can still fail. Webhook failures are logged, but there is no automatic replay worker; manual refresh/import or operator recovery may be needed.
- The current demo does not include GitHub/deployment evidence connectors, evidence-file uploads, automatic invoice reminders, polling workers, or replay-case mode.
