import { PingResult } from 'app/lib/monitor-fetch';
import { prisma } from 'app/lib/prisma';
import { buildEvent, WebsiteEventParams } from 'app/models/WebsiteEvent';

import {
  Website,
  TraceType,
  TraceStatus,
} from '.prisma/client';

function getTraceStatus(result: PingResult) {
  if (result.timeout) {
    return TraceStatus.TIMEOUT;
  }
  if (result.tlsError) {
    return TraceStatus.SSL_ERROR;
  }
  if (result.statusCode >= 200 && result.statusCode < 300) {
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
    const traceStatus = getTraceStatus(result);
    return prisma.trace.create({
      data: {
        traceType: TraceType.PING,
        websiteId: website.id,
        userId: website.userId,
        status: traceStatus,
        httpStatusCode: result.statusCode,
        duration: result.latency,
        requestHeaders: result.reqHeaders?.join('\n'),
        responseHeaders: result.resHeaders?.join('\n'),
        responseData: traceStatus === TraceStatus.OK ? '' : result.resBody,
      },
    });
  }

  async addEvent(params: WebsiteEventParams) {
    const createInput = buildEvent(params);
    if (createInput === null) {
      return Promise.reject();
    }
    return prisma.event.create({
      data: createInput,
    });
  }
}
