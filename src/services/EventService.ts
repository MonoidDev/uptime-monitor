import { EventQuery } from 'app/../graphql/client/generated';
import { buildEvent, WebsiteEventParams } from 'app/models/WebsiteEvent';
import { getStartFromRangeTime } from 'app/utils/date';

import { BaseService } from './BaseService';
import { createCursorQuery } from './helpers/cursorQuery';

export class EventService extends BaseService {
  async addEvent(params: WebsiteEventParams) {
    const createInput = buildEvent(params);
    if (createInput === null) {
      return Promise.reject();
    }
    return this.ctx.prisma.event.create({
      data: createInput,
    });
  }

  async findEvents(query: EventQuery) {
    const { websiteId, rangeTime, timeAfter, timeBefore } = query;

    const { cursorWhere, orderBy } = createCursorQuery(query);

    const where = {
      ...(websiteId && {
        websiteId,
      }),
      ...(rangeTime && {
        createdAt: {
          gt: getStartFromRangeTime(rangeTime),
        },
      }),
      ...(timeAfter && {
        createdAt: {
          gt: timeAfter,
        },
      }),
      ...(timeBefore && {
        createdAt: {
          lt: timeBefore,
        },
      }),
      website: {
        userId: this.ctx.authInfo!.id,
      },
    } as const;

    const minId = (
      await this.ctx.prisma.event.findFirst({
        where,
        orderBy: {
          createdAt: 'asc',
        },
      })
    )?.id;

    const maxId = (
      await this.ctx.prisma.event.findFirst({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      })
    )?.id;

    const whereWithId = {
      ...cursorWhere,
      ...where,
    } as const;

    const results = await this.ctx.prisma.event.findMany({
      where: whereWithId,
      orderBy,
      take: 8,
    });

    return {
      minId,
      maxId,
      results: results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }
}
