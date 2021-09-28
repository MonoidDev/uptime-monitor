import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as t from 'io-ts';

import { TraceQuery } from '../../graphql/client/generated';
import { CreateTraceSchema } from '../graphql/types/TraceSchema';
import { getStartFromRangeTime, getTickFromRangeTime } from '../utils/date';
import { BaseService } from './BaseService';
import { Prisma } from '.prisma/client';

dayjs.extend(duration);

export type CountGroup = { groupId: number, count: number }[];

export type AverageDurationGroup = { groupId: number, avgDuration: number }[];

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

  async queryErrorCountGroupByDate(rangeTime: string, byWebsiteId?: number | null): Promise<CountGroup> {
    const websiteIds = byWebsiteId
      ? [byWebsiteId]
      : await this.ctx.websiteService.findUserWebsiteIds();

    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`
        SELECT
          groupId "groupId", count(*)
          FROM (
            SELECT
            (23 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600)) groupId
            FROM "Trace" WHERE
              EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24)
              and status != 'OK'
              and "websiteId" IN (${Prisma.join(websiteIds)})
          ) as tmp group by groupId order by groupId;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`
        SELECT
          groupId "groupId", count(*)
          FROM (
            SELECT
            (27 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600)) groupId
            FROM "Trace" WHERE
              EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 7)
              and status != 'OK'
              and "websiteId" IN (${Prisma.join(websiteIds)})
          ) as tmp group by groupId order by groupId;`;
      default:
        return this.ctx.prisma.$queryRaw`
        SELECT
          groupId "groupId", count(*)
          FROM (
            SELECT
            (30 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400)) groupId
            FROM "Trace" WHERE
              EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 31)
              and status != 'OK'
              and "websiteId" IN (${Prisma.join(websiteIds)})
          ) as tmp group by groupId order by groupId;`;
    }
  }

  async queryAverageDurationGroupByDate(rangeTime: string): Promise<AverageDurationGroup> {
    const userId = this.ctx.authInfo!.id;
    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`
          SELECT
          groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
              SELECT
              (23 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600)) groupId, duration
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24) and status = 'OK' and "userId" = ${userId}
            ) as tmp group by groupId order by groupId;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`
          SELECT
            groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
              SELECT
              (27 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600)) groupId, duration
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 7) and status = 'OK' and "userId" = ${userId}
            ) as tmp group by groupId order by groupId;`;
      default:
        return this.ctx.prisma.$queryRaw`
          SELECT
            groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
                SELECT
                (30 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400)) groupId, duration
                FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 31) and status = 'OK' and "userId" = ${userId}
            ) as tmp group by groupId order by groupId;`;
    }
  }

  async findErrorCountGroupByDate(rangeTime: string, websiteId?: number | null) {
    const queryResult = await this.queryErrorCountGroupByDate(rangeTime, websiteId);
    const result = queryResult.map(({ groupId, count }) => ({
      time: getTickFromRangeTime(rangeTime, groupId),
      groupId,
      count,
    }));
    return result;
  }

  async findAverageDurationGroupByDate(rangeTime: string) {
    const queryResult = await this.queryAverageDurationGroupByDate(rangeTime);
    const result = queryResult.map(({ groupId, avgDuration }) => ({
      time: getTickFromRangeTime(rangeTime, groupId),
      groupId,
      avgDuration,
    }));
    return result;
  }

  async findTraces(query: TraceQuery) {
    const {
      beforeId,
      afterId,
      isError,
      websiteId,
      rangeTime,
    } = query;

    const where = {
      ...isError && {
        status: {
          not: 'OK' as const,
        },
      },
      ...websiteId && {
        websiteId,
      },
      ...rangeTime && {
        createdAt: {
          gt: getStartFromRangeTime(rangeTime),
        },
      },
    } as const;

    const whereWithId = {
      ...afterId && {
        id: {
          lt: afterId,
        },
      },
      ...beforeId && {
        id: {
          gt: beforeId,
        },
      },
      ...where,
      userId: this.ctx.authInfo!.id,
    } as const;

    const minId = (await this.ctx.prisma.trace.findFirst({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    }))?.id;

    const maxId = (await this.ctx.prisma.trace.findFirst({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    }))?.id;

    const results = await this.ctx.prisma.trace.findMany({
      where: whereWithId,
      orderBy: {
        id: afterId ? 'desc' : 'asc',
      },
      include: {
        website: true,
      },
      take: 8,
    });

    return {
      minId,
      maxId,
      results: results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    };
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
