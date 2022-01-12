import { Webhook } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-errors';
import { CreateWebhookSchema } from 'app/graphql/types/WebhookSchema';
import { WebhookResult } from 'graphql/client/generated';
import * as t from 'io-ts';

import { BaseService } from './BaseService';
import { WebhookInvokeService } from './WebhookInvokeService';

export class WebhookService extends BaseService {
  invokeService = new WebhookInvokeService();

  async checkOwnership(userId: number, id: number) {
    if (
      !(await this.ctx.prisma.webhook.findFirst({
        where: {
          userId,
          id,
        },
      }))
    ) {
      throw new AuthenticationError(`Webhook ${id} is not accessible to ${userId}`);
    }
  }

  async testWebhook(webhook: t.TypeOf<typeof CreateWebhookSchema>): Promise<WebhookResult> {
    return this.invokeService.testWebhook(webhook);
  }

  async createWebhook(webhook: t.TypeOf<typeof CreateWebhookSchema>): Promise<Webhook> {
    const userId = this.ctx.authInfo!.id;
    const result = await this.ctx.prisma.webhook.create({
      data: {
        ...webhook,
        userId,
      },
    });
    return result;
  }

  async updateWebhook(id: number, webhook: t.TypeOf<typeof CreateWebhookSchema>): Promise<Webhook> {
    const userId = this.ctx.authInfo!.id;
    await this.checkOwnership(userId, id);
    const result = await this.ctx.prisma.webhook.update({
      where: {
        id,
      },
      data: webhook,
    });
    return result;
  }

  async countWebhooks(): Promise<number> {
    const userId = this.ctx.authInfo!.id;

    const result = await this.ctx.prisma.webhook.count({
      where: {
        userId,
      },
    });
    return result;
  }

  async findWebhooks(page: number, pageSize: number): Promise<Webhook[]> {
    const userId = this.ctx.authInfo!.id;

    const result = await this.ctx.prisma.webhook.findMany({
      where: {
        userId,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        id: 'desc',
      },
    });
    return result;
  }

  async findWebhookById(id: number): Promise<Webhook | null> {
    const userId = this.ctx.authInfo!.id;

    const result = await this.ctx.prisma.webhook.findUnique({
      where: { id },
    });

    if (result?.userId !== userId) {
      throw new AuthenticationError(`Webhook ${id} is not accessible to ${userId}`);
    }

    return result;
  }

  async deleteWebhookById(id: number): Promise<Webhook> {
    const userId = this.ctx.authInfo!.id;
    await this.checkOwnership(userId, id);

    const result = await this.ctx.prisma.webhook.delete({
      where: {
        id,
      },
    });

    return result;
  }
}
