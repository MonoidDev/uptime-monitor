import MyScheduler from '../src/lib/my-scheduler';

process.once('SIGINT', async () => {
  MyScheduler.stop();
});

process.once('exit', () => {
  console.log('[monitor] process exiting');
});

MyScheduler.start();
