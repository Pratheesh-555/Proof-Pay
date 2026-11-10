import 'dotenv/config';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  console.error('MongoDB check failed: MONGODB_URI is missing from server/.env.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log('MongoDB connection OK.');
} catch (error) {
  const message = String(error.message ?? error).replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, 'mongodb+srv://[credentials-redacted]@');
  console.error(`MongoDB check failed: ${error.name ?? 'Error'}: ${message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
