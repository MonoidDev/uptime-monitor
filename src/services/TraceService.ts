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
    if (rangeTime === '24h') {
      return this.ctx.prisma.$queryRaw`SELECT
      time_range, count(*)
      FROM (
          SELECT to_char("createdAt", 'yyyy-mm-dd hh24:00:00') time_range FROM public."Trace"
          WHERE "createdAt" > (current_timestamp - interval '1 day')
      ) as tmp group by time_range;`;
    } if (rangeTime === '31d') {
      return this.ctx.prisma.$queryRaw`SELECT
      time_range, count(*)
      FROM (
          SELECT to_char("createdAt", 'yyyy-mm-dd 00:00:00') time_range FROM "Trace"
          WHERE "createdAt" > (current_timestamp - interval '31 day')
      ) as tmp group by time_range;`;
    }
    return this.ctx.prisma.$queryRaw`SELECT
      time_range, count(*)
      FROM (
          SELECT to_char("createdAt", 'yyyy-mm-dd 00:00:00') time_range FROM "Trace"
          WHERE "createdAt" > (current_timestamp - interval '31 day')
      ) as tmp group by time_range;`;
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
    return this.ctx.prisma.trace.create({
      data: {
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
