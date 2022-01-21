import { Trace, TraceStatus } from '@prisma/client';
import { WebsiteEventSource } from 'app/graphql/types/EventSchema';

export const getEventSourceByTrace = (lastTrace: Trace | null, currentTrace: Trace) => {
  const currentFailed = currentTrace.status !== TraceStatus.OK;
  const currentOk = currentTrace.status === TraceStatus.OK;
  const lastFailed = lastTrace?.status !== TraceStatus.OK;
  const lastOk = lastTrace?.status === TraceStatus.OK;

  if (currentFailed && (lastOk || lastTrace === null)) {
    return WebsiteEventSource.NotAvailable;
  }

  if (currentOk && (lastFailed || lastTrace === null)) {
    return WebsiteEventSource.Available;
  }

  if (currentOk && currentTrace.duration > 4500) {
    return WebsiteEventSource.HighLatency;
  }

  return null;
};
