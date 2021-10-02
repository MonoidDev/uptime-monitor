import {
  WebsiteEventDataHighLatency,
  WebsiteEventSource,
} from 'app/graphql/types/EventSchema';

import {
  Prisma,
  SeverityType,
  Trace,
  Website,
} from '.prisma/client';

export type WebsiteEventParams = {
  website: Website,
  trace?: Trace,
  source: WebsiteEventSource,
  data?: unknown,
};

function buildEvent(params: WebsiteEventParams) {
  let eventSeverity: SeverityType;
  // eslint-disable-next-line prefer-const
  let eventDataString: string = '';
  switch (params.source) {
    case WebsiteEventSource.Enabled: {
      // const eventData = (params.data as WebsiteEventDataEnabled);
      eventSeverity = SeverityType.LOG;
      // eventDataString = JSON.stringify(eventData);
      break;
    }
    case WebsiteEventSource.Disabled: {
      // const eventData = (params.data as WebsiteEventDataDisabled);
      eventSeverity = SeverityType.LOG;
      // eventDataString = JSON.stringify(eventData);
      break;
    }
    case WebsiteEventSource.Available: {
      // const eventData = (params.data as WebsiteEventDataAvailable);
      eventSeverity = SeverityType.LOG;
      // eventDataString = JSON.stringify(eventData);
      break;
    }
    case WebsiteEventSource.NotAvailable: {
      // const eventData = (params.data as WebsiteEventDataNotAvailable);
      eventSeverity = SeverityType.ERROR;
      // eventDataString = JSON.stringify(eventData);
      break;
    }
    case WebsiteEventSource.HighLatency: {
      const eventData = (params.data as WebsiteEventDataHighLatency);
      eventSeverity = eventData?.isActive ? SeverityType.WARN : SeverityType.WARN;
      // eventDataString = JSON.stringify(eventData);
      break;
    }
    default: {
      console.error(`Unknown event source: ${params.source}`);
      return null;
    }
  }

  const createInput: Prisma.EventUncheckedCreateInput = {
    type: params.source.toString(),
    websiteId: params.website.id,
    status: eventSeverity,
    traceId: params.trace?.id,
    data: eventDataString,
  };
  return createInput;
}

export {
  buildEvent,
};
