import { queryField, nonNull, intArg } from 'nexus';

import { loginRequired } from '../auth';

export const webhooks = queryField('webhooks', {
  type: 'PaginatedWebhooks',
  args: {
    page: nonNull(intArg()),
    pageSize: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { page, pageSize }, ctx) {
    const count = await ctx.webhookService.countWebhooks();
    const results = await ctx.webhookService.findWebhooks(page, pageSize);
    return {
      count,
      results,
    };
  },
});

export const webhook = queryField('webhook', {
  type: 'Webhook',
  args: {
    webhookId: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { webhookId }, ctx) {
    return ctx.webhookService.findWebhookById(webhookId);
  },
});
