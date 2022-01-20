import { TraceStatus } from '@prisma/client';
import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import { MonitorService } from 'app/services/MonitorService';
import debug from 'debug';

import { MonitorPlugin } from '../MonitorPlugin';

const eventDebug = debug('monitor:event');

export const eventPlugin = (): MonitorPlugin => {
  const monitorService = new MonitorService();

  return {
    name: 'event',
    async onTraceFetched(website, lastTrace, currentTrace) {
      const currentOk = currentTrace.status === TraceStatus.OK;
      if (lastTrace) {
        const lastOk = lastTrace.status === TraceStatus.OK;
        if (lastOk === currentOk) {
          // no status changed
          return;
        }
      }

      if (currentOk) {
        eventDebug(`${website.url} becomes available`);
        await monitorService.addEvent({
          source: WebsiteEventSource.Available,
          website,
          trace: currentTrace,
        });
        return;
      }

      eventDebug(`${website.url} becomes not available`);
      await monitorService.addEvent({
        source: WebsiteEventSource.NotAvailable,
        website,
        trace: currentTrace,
      });
      return;
    },
  };
};
