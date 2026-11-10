import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';
import { connectDb } from '../src/db/connect.js';
import { Client, Milestone, Project, User } from '../src/db/models.js';

await connectDb();
try {
  const email = config.SEED_FREELANCER_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(config.SEED_FREELANCER_PASSWORD, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, passwordHash, name: 'ProofPay Demo', businessName: 'ProofPay Studio' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const clientEmail = (config.SANDBOX_BUYER_EMAIL || 'sandbox-buyer@example.test').toLowerCase();
  const client = await Client.findOneAndUpdate(
    { ownerId: user._id, email: clientEmail },
    { $setOnInsert: { ownerId: user._id, email: clientEmail, name: 'Sandbox Buyer', company: 'PayPal Sandbox' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const project = await Project.findOneAndUpdate(
    { ownerId: user._id, title: 'ProofPay Sandbox payment lifecycle' },
    { $setOnInsert: {
      ownerId: user._id,
      clientId: client._id,
      title: 'ProofPay Sandbox payment lifecycle',
      description: 'A clearly labeled Sandbox workspace for demonstrating client approval, PayPal invoicing, evidence capture, and dispute review.',
      refundCapPct: 30,
      autoReminders: false,
      status: 'ACTIVE',
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const existingMilestone = await Milestone.findOne({ projectId: project._id, title: 'Sandbox payment and dispute validation' });
  if (!existingMilestone) await Milestone.create({
    projectId: project._id,
    index: 1,
    title: 'Sandbox payment and dispute validation',
    scope: 'Demonstration record only. Map the actual Sandbox dispute after importing it. This is not a claim that a real service was delivered.',
    amountCents: 500,
    currency: 'USD',
    acceptanceCriteria: [
      { id: 'c1', text: 'Client approval can be recorded through the ProofPay review link.' },
      { id: 'c2', text: 'PayPal Sandbox invoice and dispute details can be reviewed in one workspace.' },
    ],
    status: 'DRAFT',
  });
  console.log(`Seed complete. Demo login: ${email}`);
  console.log('A clearly labeled $5 Sandbox validation project and DRAFT milestone are ready. No fake payment or delivery evidence was created.');
} finally {
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}
