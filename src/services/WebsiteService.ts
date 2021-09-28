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
    const skip = (page - 1) * 10;
    const userId = this.ctx.authInfo!.id;
    return this.ctx.prisma.website.findMany({
      skip,
      take: 10,
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
