import { Monitor } from 'app/lib/monitor-new/Monitor';
import { eventPlugin } from 'app/lib/monitor-new/plugins/eventPlugin';
import { sslPlugin } from 'app/lib/monitor-new/plugins/sslPlugin';

(async () => {
  const monitor = new Monitor({
    concurrency: 8,
    plugins: [eventPlugin(), sslPlugin()],
  });

  await monitor.run();
})();
