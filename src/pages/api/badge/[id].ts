import { createContext } from 'app/graphql/context';
import { RequestHandler } from 'app/utils/types';

export default (async (req, res) => {
  const context = await createContext({ req, res });
  context.exemptAuth = true;

  const { id, rangeTime = '24h' } = req.query as { id: string; rangeTime?: string };

  const { allTraces, oks } = await context.traceService.getBadgeStatistics(rangeTime, parseInt(id));

  const percent = allTraces === 0 ? 'unknown' : (Math.floor((oks / allTraces) * 1000) / 1000) * 100;

  const color =
    percent === 'unknown'
      ? 'inactive'
      : percent >= 100
      ? 'brightgreen'
      : percent >= 90
      ? 'important'
      : 'critical';

  res.redirect(
    `https://img.shields.io/badge/${rangeTime}-${encodeURIComponent(percent + '%')}-${color}`,
  );
}) as RequestHandler;
