import { EventQuery } from '../../graphql/client/generated';
import { getStartFromRangeTime } from '../utils/date';
import { BaseService } from './BaseService';
import { createCursorQuery } from './helpers/cursorQuery';

export class EventService extends BaseService {
  async findEvents(query: EventQuery) {
    const {
      websiteId,
      rangeTime,
      timeAfter,
      timeBefore,
    } = query;

    const { cursorWhere, orderBy } = createCursorQuery(query);

    const where = {
      ...websiteId && {
        websiteId,
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

    const minId = (await this.ctx.prisma.event.findFirst({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    }))?.id;

    const maxId = (await this.ctx.prisma.event.findFirst({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    }))?.id;

    const whereWithId = {
      ...cursorWhere,
      ...where,
      website: {
        userId: this.ctx.authInfo!.id,
      },
    } as const;

    const results = await this.ctx.prisma.event.findMany({
      where: whereWithId,
      orderBy,
      include: {
        website: true,
        trace: true,
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
