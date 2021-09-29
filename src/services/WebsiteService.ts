import * as t from 'io-ts';

import { CreateUpdateWebsiteSchema } from '../graphql/types/WebsiteSchema';
import { BaseService } from './BaseService';

export class WebsiteService extends BaseService {
  async findWebsiteById(id: number) {
    return this.ctx.prisma.website.findUnique({
      where: {
        id,
      },
    });
  }

  async findWebsites(page: number) {
    const skip = (page - 1) * 8;
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.findMany({
      skip,
      take: 8,
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

    return (await this.ctx.prisma.website.findMany({
      where: { userId },
    }))
      .map((w) => w.id);
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
    const queryResult = await this.ctx.prisma.$queryRaw`SELECT
        groupId "groupId",
        SUM(CASE WHEN status = 'HTTP_ERROR' THEN 1 ELSE 0 END) "httpErrorCount"
      FROM (
        SELECT
        (11 - floor((EXTRACT(epoch FROM current_timestamp) - EXTRACT(epoch FROM "createdAt")) / 7200)) groupId, status
        FROM "Trace" WHERE
          EXTRACT(epoch FROM "createdAt") > (EXTRACT(epoch FROM current_timestamp) - 3600 * 24) and
          "websiteId" = ${websiteId}
      ) as tmp group by groupId order by groupId;`;
    const ranges = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return ranges.map((tick) => {
      const info = queryResult[tick];
      if (info) {
        return info.httpErrorCount > 0 ? 'ERROR' : 'OK';
      }
      return 'UNAVAILABLE';
    });
  }

  async total() {
    return this.ctx.prisma.website.count();
  }

  createWebsite(website: t.TypeOf<typeof CreateUpdateWebsiteSchema>) {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.create({
      data: {
        userId,
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        enabled: website!.enabled,
        emails: website!.emails,
      },
    });
  }

  updateWebsite(websiteId: number, website: t.TypeOf<typeof CreateUpdateWebsiteSchema>) {
    return this.ctx.prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        enabled: website!.enabled,
        emails: website!.emails,
      },
    });
  }

  deleteWebsite(websiteId: number) {
    return this.ctx.prisma.website.delete({
      where: {
        id: websiteId,
      },
    });
  }
}
