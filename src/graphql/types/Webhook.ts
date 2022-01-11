import { objectType, inputObjectType, nonNull } from 'nexus';

export const Webhook = objectType({
  name: 'Webhook',
  definition(t) {
    t.model.userId();
    t.model.id();
    t.model.name();
    t.model.type();
    t.model.url();
  },
});

export const PaginatedWebhooks = objectType({
  name: 'PaginatedWebhooks',
  definition(t) {
    t.nonNull.int('count');
    t.nonNull.list.field('results', {
      type: nonNull('Webhook'),
    });
  },
});

export const CreateWebhook = inputObjectType({
  name: 'CreateWebhook',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('type');
    t.nonNull.string('url');
  },
});

export const WebhookResult = objectType({
  name: 'WebhookResult',
  definition(t) {
    t.nonNull.boolean('success');
    t.nonNull.int('status');
    t.nonNull.string('body');
    t.nonNull.string('message');
    t.nonNull.int('duration');
  },
});
