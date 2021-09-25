import * as t from 'io-ts';

import { CreateUpdateWebsiteSchema } from '../graphql/types/WebsiteSchema';
import { BaseService } from './BaseService';

export class WebsiteSerice extends BaseService {
  async findWebsiteById(id: number) {
    return this.ctx.prisma.website.findUnique({
      where: {
        id,
      },
    });
  }

  async findWebsites(afterId: number) {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.findMany({
      where: {
        userId,
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

  createWebsite(website: t.TypeOf<typeof CreateUpdateWebsiteSchema>) {
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.create({
      data: {
        userId,
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        enabled: website!.enabled,
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
