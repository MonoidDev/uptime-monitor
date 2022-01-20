import { Trace } from '@prisma/client';
import { WebsiteWithHooks } from 'app/services/MonitorService';

export interface MonitorPlugin {
  name: string;
  onTraceFetched: (website: WebsiteWithHooks, last: Trace | null, current: Trace) => void;
}
