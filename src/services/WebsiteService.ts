import * as t from 'io-ts';

import { CreateWebsiteSchema } from '../graphql/types/WebsiteSchema';
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

  createWebsite(userId: number, website: t.TypeOf<typeof CreateWebsiteSchema>) {
    return this.ctx.prisma.website.create({
      data: {
        name: website!.name,
        url: website!.url,
        pingInterval: website!.pingInterval,
        userId,
      },
    });
  }
}
