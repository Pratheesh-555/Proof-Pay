// npm run day1:gemini -- [disputeId]
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
  console.error('==> Structured Gemini generation passed; this optional Agent Toolkit function-calling check failed. The app does not currently use AGENT_MODE as a fallback. Do not retry this tool-call check; continue with the direct PayPal API flow.');
}

