import { connectDb } from '../src/db/connect.js';
import { seedDemo } from '../src/db/seedDemo.js';

await connectDb();
try {
  const { user } = await seedDemo();
  console.log(`Seed complete. Demo login: ${user.email}`);
  console.log('A clearly labeled $5 Sandbox validation project and DRAFT milestone are ready. No fake payment or delivery evidence was created.');
} finally {
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}
