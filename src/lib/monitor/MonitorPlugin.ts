import { Trace } from '@prisma/client';
import { WebsiteWithHooks } from 'app/services/MonitorService';

import { PingResult } from './doPing';

export interface MonitorPlugin {
  name: string;
  onTraceFetched?: (
    website: WebsiteWithHooks,
    last: Trace | null,
    current: Trace,
    pingResult: PingResult,
  ) => void;
}
