import {config} from './config.js';
import {connectDb} from './db/connect.js';
import app from './app.js';
import {startScheduler} from './jobs/scheduler.js';
import {log} from './lib/log.js';

await connectDb();
if (process.env.SEED_DEMO_ON_START === 'true') {
  const { seedDemo } = await import('./db/seedDemo.js');
  await seedDemo();
  log.info('demo.seeded');
}
const server=app.listen(config.PORT,()=>log.info('server.started',{port:config.PORT,environment:config.NODE_ENV}));
startScheduler();
const shutdown=async(signal)=>{log.info('server.shutdown',{signal});server.close(async()=>{const mongoose=await import('mongoose');await mongoose.default.disconnect();process.exit(0)});setTimeout(()=>process.exit(1),10000).unref()};
process.on('SIGINT',()=>shutdown('SIGINT'));process.on('SIGTERM',()=>shutdown('SIGTERM'));

