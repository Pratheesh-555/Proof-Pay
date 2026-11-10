import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_BASE_URL: z.string().url(), MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32), CLIENT_LINK_SECRET: z.string().min(32), IP_HASH_SALT: z.string().min(16),
  SEED_FREELANCER_EMAIL: z.string().email(), SEED_FREELANCER_PASSWORD: z.string().min(8),
  PAYPAL_ENV: z.literal('sandbox').default('sandbox'), PAYPAL_CLIENT_ID: z.string().min(1), PAYPAL_CLIENT_SECRET: z.string().min(1),
  PAYPAL_WEBHOOK_ID: z.string().min(1), WEBHOOK_VERIFY: z.enum(['offline', 'online', 'off']).default('offline'),
  SANDBOX_BUYER_EMAIL: z.string().email().optional(), SANDBOX_BUYER_PAYER_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1), GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'), AGENT_MODE: z.enum(['tools', 'direct']).default('tools'),
  GITHUB_TOKEN: z.string().optional(), REMINDER_INTERVAL_MINUTES: z.coerce.number().positive().default(1440),
  DISPUTE_POLL_MINUTES: z.coerce.number().positive().default(5), DEBUG_TOKEN: z.string().min(8),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid server configuration:');
  for (const issue of parsed.error.issues) console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}
if (parsed.data.NODE_ENV === 'production' && parsed.data.WEBHOOK_VERIFY === 'off') {
  console.error('WEBHOOK_VERIFY=off is prohibited in production.'); process.exit(1);
}
export const config = Object.freeze(parsed.data);

