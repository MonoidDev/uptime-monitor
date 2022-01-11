import { intArg, mutationField, nonNull } from 'nexus';

import { loginRequired } from '../auth';
import { CreateWebhook } from '../types/Webhook';
import { CreateWebhookSchema } from '../types/WebhookSchema';

export const testWebhook = mutationField('testWebhook', {
  type: 'WebhookResult',
  authorize: loginRequired,
  args: {
    webhook: nonNull(CreateWebhook),
  },
  validate: {
    webhook: CreateWebhookSchema,
  },
  async resolve(_, { webhook }, ctx) {
    const result = await ctx.webhookService.testWebhook(webhook);
    return result;
  },
});

export const createWebhook = mutationField('createWebhook', {
  type: 'Webhook',
  authorize: loginRequired,
  args: {
    webhook: nonNull(CreateWebhook),
  },
  validate: {
    webhook: CreateWebhookSchema,
  },
  async resolve(_, { webhook }, ctx) {
    const result = await ctx.webhookService.createWebhook(webhook);
    return result;
  },
});

export const updateWebhook = mutationField('updateWebhook', {
  type: 'Webhook',
  authorize: loginRequired,
  args: {
    webhookId: nonNull(intArg()),
    webhook: nonNull(CreateWebhook),
  },
  validate: {
    webhook: CreateWebhookSchema,
  },
  async resolve(_, { webhookId, webhook }, ctx) {
    const result = await ctx.webhookService.updateWebhook(webhookId, webhook);
    return result;
  },
});

export const deleteWebhook = mutationField('deleteWebhook', {
  type: 'Webhook',
  authorize: loginRequired,
  args: {
    webhookId: nonNull(intArg()),
  },
  async resolve(_, { webhookId }, ctx) {
    const result = await ctx.webhookService.deleteWebhookById(webhookId);
    return result;
  },
});
