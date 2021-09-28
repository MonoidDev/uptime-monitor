import { getTickFromRangeTime } from 'app/utils/date';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as t from 'io-ts';

import { CreateTraceSchema } from '../graphql/types/TraceSchema';
import { BaseService } from './BaseService';

dayjs.extend(duration);

export type CountGroup = { groupId: number, count: number }[];

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

  async queryErrorCountGroupByDate(rangeTime: string): Promise<CountGroup> {
    const userId = this.ctx.authInfo!.id;

    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`
        SELECT
          groupId "groupId", count(*)
          FROM (
              SELECT
              (23 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600)) groupId
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24) and status != 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`
        SELECT
        groupId "groupId", count(*)
          FROM (
              SELECT
              (27 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600)) groupId
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 7) and status != 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
      default:
        return this.ctx.prisma.$queryRaw`
        SELECT
        groupId "groupId", count(*)
          FROM (
              SELECT
              (30 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400)) groupId
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 31) and status != 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
    }
  }

  async findAverageDurationGroupByDate(rangeTime: string) {
    const userId = this.ctx.authInfo!.id;
    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`SELECT
          groupId "groupId", avg(duration) "avgDuration"
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600) groupId, duration
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '1 day') and status = 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`SELECT
        groupId "groupId", avg(duration) "avgDuration"
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600) groupId, duration
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '7 day') and status = 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
      default:
        return this.ctx.prisma.$queryRaw`SELECT
        groupId "groupId", avg(duration) "avgDuration"
          FROM (
              SELECT
              floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400) groupId, duration
              FROM "Trace" WHERE "createdAt" > (current_timestamp - interval '31 day') and status = 'OK' and "userId" = ${userId}
          ) as tmp group by groupId order by groupId;`;
    }
  }

  async findErrorCountGroupByDate(rangeTime: string) {
    const queryResult = await this.queryErrorCountGroupByDate(rangeTime);
    const result = queryResult.map(({ groupId, count }) => ({
      time: getTickFromRangeTime(rangeTime, groupId),
      groupId,
      count,
    }));
    console.log(result);

    return result;
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
