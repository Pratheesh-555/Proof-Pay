import {z} from 'zod';
export const AssessmentSchema=z.object({criteria:z.array(z.object({criterionId:z.string(),verdict:z.enum(['MET','NOT_MET','UNCLEAR']),evidenceIds:z.array(z.string()),reasoning:z.string()})),overall:z.object({done:z.enum(['YES','PARTIAL','NO']),confidence:z.number().min(0).max(1)})});
export const StrategySchema=z.object({action:z.enum(['FIGHT','PARTIAL_REFUND','ACCEPT']),refundPct:z.number().min(0).max(100).optional(),rationale:z.string()});
export const DraftSchema=z.object({claims:z.array(z.object({text:z.string(),evidenceIds:z.array(z.string())})),closing:z.string()});
export const SupportSchema=z.object({results:z.array(z.object({index:z.number().int(),verdict:z.enum(['SUPPORTED','UNSUPPORTED']),why:z.string()}))});
