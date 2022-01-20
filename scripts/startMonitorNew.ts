import { Monitor } from 'app/lib/monitor-new/Monitor';
import { emailPlugin } from 'app/lib/monitor-new/plugins/emailPlugin';
import { eventPlugin } from 'app/lib/monitor-new/plugins/eventPlugin';
import { webhookPlugin } from 'app/lib/monitor-new/plugins/webhookPlugin';

(async () => {
  const monitor = new Monitor({
    concurrency: 8,
    port: 5656,
    host: 'localhost',
    plugins: [eventPlugin(), emailPlugin(), webhookPlugin()],
  });

  await monitor.run();
})();
