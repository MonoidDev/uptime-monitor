import { PingResult } from '../lib/my-fetch';
import { prisma } from '../lib/prisma';
import { Website, TraceType, TraceStatus } from '.prisma/client';

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
        requestHeaders: result.reqHeaders.join('\n'),
        responseHeaders: result.resHeaders.join('\n'),
        responseData: result.resBody,
      },
    });
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async addEvent(website: Website, event: object) {
    // TODO
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
