import { createContext } from 'app/graphql/context';
import { RequestHandler } from 'app/utils/types';

import { TraceStatus } from '.prisma/client';

export default (async (req, res) => {
  const context = await createContext({ req, res });
  context.exemptAuth = true;

  const { id, rangeTime = '24h' } = req.query as { id: string; rangeTime?: string };

  const result = await context.traceService.findTraces({ websiteId: parseInt(id), rangeTime });

  const oks = result.results.filter((r) => r.status === TraceStatus.OK);

  const percent =
    result.results.length === 0
      ? 'unknown'
      : (Math.floor((oks.length / result.results.length) * 1000) / 1000) * 100;

  const color =
    percent === 'unknown'
      ? 'inactive'
      : percent >= 100
      ? 'brightgreen'
      : percent >= 90
      ? 'important'
      : 'critical';

  res.redirect(`https://img.shields.io/badge/uptime-${encodeURIComponent(percent + '%')}-${color}`);
}) as RequestHandler;
