import { Monitor } from 'app/lib/monitor/Monitor';
import { eventPlugin } from 'app/lib/monitor/plugins/eventPlugin';
import { sslPlugin } from 'app/lib/monitor/plugins/sslPlugin';

(async () => {
  const monitor = new Monitor({
    concurrency: 8,
    plugins: [eventPlugin(), sslPlugin()],
  });

  await monitor.run();
})();
