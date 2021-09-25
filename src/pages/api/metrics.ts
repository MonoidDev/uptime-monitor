import { Registry, collectDefaultMetrics } from 'prom-client';

import { RequestHandler } from '../../utils/types';

const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: 'uptime_',
});

export default (async (_, res) => {
  res.setHeader('Content-type', registry.contentType);
  res.write(await registry.metrics());
  res.end();
  return undefined;
}) as RequestHandler;
