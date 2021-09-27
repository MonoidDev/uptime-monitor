import * as t from 'io-ts';

import { CreateTraceSchema } from '../graphql/types/TraceSchema';
import { BaseService } from './BaseService';

export class TraceService extends BaseService {
  async findTraceById(id: number) {
    return this.ctx.prisma.trace.findUnique({
      where: {
        id,
      },
      include: {
        website: true,
      },
    });
  }

  async findErrorCountGroupByDate(rangeTime: string) {
    const userId = this.ctx.authInfo!.id;
    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`SELECT
          group_id, count(*)
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600) group_id
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '1 day') and status != 'OK' and "userId" = ${userId}
          ) as tmp group by group_id order by group_id;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`SELECT
          group_id, count(*)
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600) group_id
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '7 day') and status != 'OK' and "userId" = ${userId}
          ) as tmp group by group_id order by group_id;`;
      default:
        return this.ctx.prisma.$queryRaw`SELECT
          group_id, count(*)
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400) group_id
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '31 day') and status != 'OK' and "userId" = ${userId}
          ) as tmp group by group_id order by group_id;`;
    }
  }

  async findTraces(afterId: number) {
    return this.ctx.prisma.trace.findMany({
      where: {
        id: {
          lt: afterId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  createTrace(trace: t.TypeOf<typeof CreateTraceSchema>) {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.trace.create({
      data: {
        userId,
        traceType: trace!.traceType,
        websiteId: trace!.websiteId,
        duration: trace!.duration,
        status: trace!.status,
        requestHeaders: trace!.requestHeaders,
        responseHeaders: trace!.responseHeaders,
        responseData: trace!.responseData,
      },
    });
  }
}
