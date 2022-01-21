import { ErrorPredicate } from '@prisma/client';
import { ValidationError } from 'apollo-server-errors';
import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import * as t from 'io-ts';
import { range } from 'lodash-es';
import fetch from 'node-fetch';

import { CreateUpdateWebsiteSchema } from '../graphql/types/WebsiteSchema';
import { BaseService } from './BaseService';
import { mapSortOrder } from './helpers/mapSortOrder';

export class WebsiteService extends BaseService {
  async findWebsiteById(id: number) {
    return this.ctx.prisma.website.findUnique({
      where: {
        id,
      },
    });
  }

  async findWebsites(
    page: number,
    pageSize: number,
    keyword?: string | null,
    sortByName?: string | null,
  ) {
    const skip = (page - 1) * pageSize;
    return this.ctx.prisma.website.findMany({
      skip,
      take: pageSize,
      where: {
        ...this.getFilterWebsiteWhere(keyword),
      },
      orderBy: {
        ...(!sortByName && {
          createdAt: 'desc',
        }),
        ...(sortByName && {
          name: mapSortOrder(sortByName),
        }),
      },
    });
  }

  async findUserWebsites() {
    const userId = this.ctx.authInfo!.id;

    return this.ctx.prisma.website.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserWebsiteIds() {
    const userId = this.ctx.authInfo!.id;

    return (
      await this.ctx.prisma.website.findMany({
        where: { userId },
      })
    ).map((w) => w.id);
  }

  async findFirstWebsite() {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.findFirst({
      take: 1,
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findWebsiteStatus(websiteId: number) {
    const queryResult: any = await this.ctx.prisma.$queryRaw`
      SELECT
        groupId "groupId",
        SUM(CASE WHEN status != 'OK' THEN 1 ELSE 0 END) "httpErrorCount"
      FROM (
        SELECT
        (11 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 7200)) groupId, status
        FROM "Trace" WHERE
          EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24) and
          "websiteId" = ${websiteId}
      ) as tmp group by groupId order by groupId;
    `;

    const groupIdToErrorCount = new Map<number, number>(
      queryResult.map(({ groupId, httpErrorCount }: any) => [groupId, httpErrorCount]),
    );

    return range(12).map((tick) => {
      const errorCount = groupIdToErrorCount.get(tick);
      if (errorCount === undefined) return 'UNKNOWN';
      return errorCount > 0 ? 'ERROR' : 'OK';
    });
  }

  async total(keyword?: string | null) {
    return this.ctx.prisma.website.count({
      where: {
        ...this.getFilterWebsiteWhere(keyword),
      },
    });
  }

  async createWebsite(website: t.TypeOf<typeof CreateUpdateWebsiteSchema>) {
    const userId = this.ctx.authInfo!.id;
    const ret = await this.ctx.prisma.website.create({
      data: {
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        enabled: website!.enabled,
        emails: website!.emails,
        webhooks: {
          connect: website.webhookIds.map((id) => ({ id })),
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    await this.ctx.eventService.addEvent({
      website: ret,
      source: ret.enabled ? WebsiteEventSource.Enabled : WebsiteEventSource.Disabled,
    });
    await this.postMonitorWebsiteAdded(ret.id);
    return ret;
  }

  async updateWebsite(websiteId: number, website: t.TypeOf<typeof CreateUpdateWebsiteSchema>) {
    const existingWebsite = await this.ctx.prisma.website.findFirst({
      where: {
        id: websiteId,
      },
    });
    if (!existingWebsite) {
      throw new ValidationError(`${websiteId} does not exist. `);
    }

    const ret = await this.ctx.prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        enabled: website!.enabled,
        emails: website!.emails,
        errorPredicate: website!.errorPredicate as ErrorPredicate,
        webhooks: {
          connect: website.webhookIds.map((id) => ({ id })),
        },
      },
    });

    if (existingWebsite.enabled !== website!.enabled) {
      await this.ctx.eventService.addEvent({
        website: ret,
        source: ret.enabled ? WebsiteEventSource.Enabled : WebsiteEventSource.Disabled,
      });
    }

    return ret;
  }

  async deleteWebsite(websiteId: number) {
    const [, , website] = await this.ctx.prisma.$transaction([
      this.ctx.prisma.event.deleteMany({
        where: {
          websiteId,
        },
      }),
      this.ctx.prisma.trace.deleteMany({
        where: {
          websiteId,
        },
      }),
      this.ctx.prisma.website.delete({
        where: {
          id: websiteId,
        },
      }),
    ]);

    return website;
  }

  async postMonitorWebsiteAdded(websiteId: number) {
    await fetch(`http://127.0.0.1:5656/website-added/${websiteId}`, {
      method: 'POST',
    });
  }

  getFilterWebsiteWhere(keyword?: string | null) {
    const userId = this.ctx.authInfo!.id;

    return {
      AND: [
        {
          userId,
        },
        {
          OR: [
            {
              ...(keyword && {
                name: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              }),
            },
            {
              ...(keyword && {
                url: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              }),
            },
          ],
        },
      ],
    };
  }
}
