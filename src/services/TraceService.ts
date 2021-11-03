import { Prisma, TraceStatus } from '@prisma/client';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { TraceQuery } from '../../graphql/client/generated';
import { getStartFromRangeTime, getTickFromRangeTime } from '../utils/date';
import { BaseService } from './BaseService';
import { createCursorQuery } from './helpers/cursorQuery';

dayjs.extend(duration);

export type CountGroup = { groupId: number, count: number }[];

export type AverageDurationGroup = { groupId: number, avgDuration: number }[];

export class TraceService extends BaseService {
  async findTraceById(id: number) {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.trace.findFirst({
      where: {
        id,
        userId,
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

  async queryAverageDurationGroupByDate(rangeTime: string, byWebsiteId?: number | null): Promise<AverageDurationGroup> {
    const websiteIds = byWebsiteId
      ? [byWebsiteId]
      : await this.ctx.websiteService.findUserWebsiteIds();

    switch (rangeTime) {
      case '24h':
        return this.ctx.prisma.$queryRaw`
          SELECT
          groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
              SELECT
              (23 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 3600)) groupId, duration
              FROM "Trace" WHERE
                EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24)
                and status = 'OK'
                and "websiteId" IN (${Prisma.join(websiteIds)})
            ) as tmp group by groupId order by groupId;`;
      case '7d':
        return this.ctx.prisma.$queryRaw`
          SELECT
            groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
              SELECT
              (27 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 21600)) groupId, duration
              FROM "Trace" WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 7)
                and status = 'OK'
                and "websiteId" IN (${Prisma.join(websiteIds)})
            ) as tmp group by groupId order by groupId;`;
      default:
        return this.ctx.prisma.$queryRaw`
          SELECT
            groupId "groupId", floor(avg(duration)) "avgDuration"
            FROM (
                SELECT
                (30 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 86400)) groupId, duration
                FROM "Trace"
                  WHERE EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 86400 * 31)
                  and status = 'OK'
                  and "websiteId" IN (${Prisma.join(websiteIds)})
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

  async findAverageDurationGroupByDate(rangeTime: string, websiteId?: number | null) {
    const queryResult = await this.queryAverageDurationGroupByDate(rangeTime, websiteId);
    const result = queryResult.map(({ groupId, avgDuration }) => ({
      time: getTickFromRangeTime(rangeTime, groupId),
      groupId,
      avgDuration,
    }));
    return result;
  }

  async findTraces(query: TraceQuery) {
    const {
      isError,
      websiteId,
      websiteIds,
      rangeTime,
      timeAfter,
      timeBefore,
      status,
    } = query;

    const { cursorWhere, orderBy } = createCursorQuery(query);

    const where = {
      ...isError && {
        status: {
          not: 'OK' as const,
        },
      },
      ...status && {
        status: {
          in: status as TraceStatus[],
        },
      },
      ...websiteId && {
        websiteId,
      },
      ...websiteIds && {
        websiteId: {
          in: websiteIds,
        },
      },
      ...rangeTime && {
        createdAt: {
          gt: getStartFromRangeTime(rangeTime),
        },
      },
      ...timeAfter && {
        createdAt: {
          gt: timeAfter,
        },
      },
      ...timeBefore && {
        createdAt: {
          lt: timeBefore,
        },
      },
    } as const;

    const whereWithId = {
      ...cursorWhere,
      ...where,
      userId: this.ctx.authInfo!.id,
    } as const;

    const minId = (await this.ctx.prisma.trace.findFirst({
      where,
      orderBy: {
        id: 'asc',
      },
    }))?.id;

    const maxId = (await this.ctx.prisma.trace.findFirst({
      where,
      orderBy: {
        id: 'desc',
      },
    }))?.id;

    const results = await this.ctx.prisma.trace.findMany({
      where: whereWithId,
      orderBy,
      include: {
        website: true,
      },
      take: 8,
    });

    return {
      minId,
      maxId,
      results: results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }
}
