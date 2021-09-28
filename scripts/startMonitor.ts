import Scheduler from '../src/lib/monitor-scheduler';

process.once('SIGINT', async () => {
  Scheduler.stop();
});

process.once('exit', () => {
  console.log('[monitor] process exiting');
});

Scheduler.start();
