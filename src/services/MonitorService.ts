import { WebsiteEventSource } from '../graphql/types/EventSchema';
import { PingResult } from '../lib/monitor-fetch';
import { prisma } from '../lib/prisma';
import {
  Website,
  Trace,
  TraceType,
  TraceStatus,
  SeverityType,
} from '.prisma/client';

export type WebsiteEventParams = {
  source: WebsiteEventSource,
  data: unknown,
};

export type WebsiteEventDataNotAvailable = boolean;

export type WebsiteEventDataHighLatency = {
  isActive: boolean,
  duration: number,
};

function getTraceStatus(result: PingResult) {
  if (result.timeout) {
    return TraceStatus.TIMEOUT;
  }
  if (result.statusCode !== 200) {
    return TraceStatus.HTTP_ERROR;
  }
  return TraceStatus.OK;
}

export class MonitorService {
  async findEnabledWebsites(count: number, lastId: number | null) {
    let args : any = {
      where: {
        enabled: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: count,
    };
    if (lastId !== null) {
      args = {
        ...args,
        cursor: {
          id: lastId,
        },
        skip: 1,
      };
    }
    return prisma.website.findMany(args);
  }

  async findLatestTraceByWebsite(websiteId: number) {
    return prisma.trace.findFirst({
      where: {
        websiteId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addTrace(website: Website, result: PingResult) {
    return prisma.trace.create({
      data: {
        traceType: TraceType.PING,
        websiteId: website.id,
        userId: website.userId,
        status: getTraceStatus(result),
        duration: result.latency,
        requestHeaders: result.reqHeaders?.join('\n'),
        responseHeaders: result.resHeaders?.join('\n'),
        responseData: result.resBody,
      },
    });
  }

  async addEvent(website: Website, trace: Trace, eventParams: WebsiteEventParams) {
    let eventSeverity: SeverityType;
    let eventDataString: string;
    switch (eventParams.source) {
      case WebsiteEventSource.NotAvailable: {
        const eventData = (eventParams.data as WebsiteEventDataNotAvailable);
        eventSeverity = eventData ? SeverityType.ERROR : SeverityType.WARN;
        eventDataString = JSON.stringify(eventData);
        break;
      }
      case WebsiteEventSource.HighLatency: {
        const eventData = (eventParams.data as WebsiteEventDataHighLatency);
        eventSeverity = eventData.isActive ? SeverityType.WARN : SeverityType.WARN;
        eventDataString = JSON.stringify(eventData);
        break;
      }
      default: {
        console.error(`[monitor] Unknown event source: ${eventParams.source}`);
        return null;
      }
    }

    return prisma.event.create({
      data: {
        type: eventParams.source.toString(),
        websiteId: website.id,
        status: eventSeverity,
        traceId: trace.id,
        data: eventDataString,
      },
    });
  }
}
