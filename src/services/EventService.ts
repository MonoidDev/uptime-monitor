import { EventQuery } from '../../graphql/client/generated';
import { getStartFromRangeTime } from '../utils/date';
import { BaseService } from './BaseService';

export class EventService extends BaseService {
  async findEvents(query: EventQuery) {
    const {
      beforeId,
      afterId,
      websiteId,
      rangeTime,
    } = query;

    const where = {
      ...websiteId && {
        websiteId,
      },
      ...rangeTime && {
        createdAt: {
          gt: getStartFromRangeTime(rangeTime),
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
      website: {
        userId: this.ctx.authInfo!.id,
      },
    } as const;

    const results = await this.ctx.prisma.event.findMany({
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
}
