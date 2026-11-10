import cron from 'node-cron';
import {log} from '../lib/log.js';
let started=false;
export function startScheduler(){if(started)return;started=true;
 cron.schedule('*/10 * * * *',()=>log.info('scheduler.invoice-poll.pending'));
 cron.schedule(`*/${Math.min(59,Math.max(1,Number(process.env.DISPUTE_POLL_MINUTES)||5))} * * * *`,()=>log.info('scheduler.dispute-poll.pending'));
 cron.schedule('*/15 * * * *',()=>log.info('scheduler.reminders.pending'));
}

