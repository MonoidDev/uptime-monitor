import Scheduler from '../src/lib/monitor-scheduler';

process.once('SIGINT', async () => {
  Scheduler.stop();
});

process.once('exit', () => {
  console.info('process exiting');
});

Scheduler.start();
