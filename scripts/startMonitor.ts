import Scheduler from '../src/lib/monitor/monitor-scheduler';

process.once('SIGINT', async () => {
  Scheduler.stop();
});

process.once('exit', () => {
  console.info('process exiting');
});

Scheduler.start();

// eslint-disable-next-line no-console
console.time('monitor');
setInterval(() => {
  // eslint-disable-next-line no-console
  console.timeLog('monitor', `Memory use: ${process.memoryUsage().rss}`);
}, 5000);
