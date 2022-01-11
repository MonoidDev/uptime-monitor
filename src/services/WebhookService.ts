import { Webhook } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-errors';
import { CreateWebhookSchema } from 'app/graphql/types/WebhookSchema';
import { TimeoutError } from 'app/utils/errors';
import { WebhookResult } from 'graphql/client/generated';
import * as t from 'io-ts';
import fetch from 'node-fetch';

import { BaseService } from './BaseService';

export class WebhookService extends BaseService {
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

  getWebhookBody(type: string, message: string) {
    switch (type) {
      case 'Lark':
        return JSON.stringify({
          msg_type: 'text',
          content: {
            text: message,
          },
        });
      case 'Slack':
        return JSON.stringify({
          text: message,
        });
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  isWebhookSuccessful(type: string, response: any) {
    switch (type) {
      case 'Lark':
        return response.StatusMessage === 'success';
      case 'Slack':
        return true;
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  async testWebhook(webhook: t.TypeOf<typeof CreateWebhookSchema>): Promise<WebhookResult> {
    const t0 = Date.now();

    try {
      const result = await Promise.race([
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: this.getWebhookBody(webhook.type, 'Hello World!'),
        }),
        new Promise<void>((_, reject) => setTimeout(() => reject(new TimeoutError()), 5000)),
      ]);

      if (result) {
        const text = await result.text();
        try {
          const json = JSON.parse(text);

          const success = result.ok && this.isWebhookSuccessful(webhook.type, json);

          return {
            success,
            status: result.status,
            body: JSON.stringify(json, undefined, 2),
            message: success ? 'Webhook called successfully. ' : 'Webhook called unsuccessfully. ',
            duration: Date.now() - t0,
          };
        } catch (e) {
          if (e instanceof SyntaxError) {
            return {
              success: false,
              status: result.status,
              body: text,
              message: e.message,
              duration: Date.now() - t0,
            };
          }
        }
      }

      throw new Error('Expect truthy result. ');
    } catch (e) {
      if (e instanceof TimeoutError) {
        return {
          success: false,
          status: 0,
          body: '',
          message: 'The request timed out. ',
          duration: Date.now() - t0,
        };
      }
      throw e;
    }
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
