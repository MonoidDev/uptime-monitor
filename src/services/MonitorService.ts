import { Website, TraceType, TraceStatus } from '@prisma/client';
import { PingResult } from 'app/lib/monitor-fetch';
import { prisma } from 'app/lib/prisma';
import { buildEvent, WebsiteEventParams } from 'app/models/WebsiteEvent';

export class MonitorService {
  async findEnabledWebsites(count: number, lastId: number | null) {
    let args: any = {
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
        status: result.traceStatus,
        httpStatusCode: result.statusCode,
        duration: result.latency,
        requestHeaders: result.reqHeaders?.join('\n'),
        responseHeaders: result.resHeaders?.join('\n'),
        responseData: result.traceStatus === TraceStatus.OK ? '' : result.resBody,
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

  async updateWebsiteHttpsCertExpiredAt(websiteId: number, expiredAt: number) {
    return prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        httpsCertExpiredAt: new Date(expiredAt),
      },
    });
  }

  async updateWebsiteHttpsCertExpireAlerted(websiteId: number, alerted: boolean) {
    return prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        httpsCertExpireAlerted: alerted,
      },
    });
  }
}
