import {
  objectType, inputObjectType, nonNull, enumType,
} from 'nexus';

export const WebsiteStatusType = enumType({
  name: 'WebsiteStatusType',
  members: ['UNAVAILABLE', 'OK', 'ERROR'],
});

export const Website = objectType({
  name: 'Website',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.url();
    t.model.pingInterval();
    t.model.enabled();
    t.model.userId();
    t.model.emails();
    t.model.createdAt({
      resolve(r) {
        return r.createdAt.toISOString();
      },
    });
    t.list.field('status', {
      type: WebsiteStatusType,
    });
  },
});

export const PaginatedWebsite = objectType({
  name: 'PaginatedWebsite',
  definition(t) {
    t.nonNull.int('count');
    t.nonNull.list.field('results', {
      type: Website,
    });
  },
});

export const CreateUpdateWebsite = inputObjectType({
  name: 'CreateUpdateWebsite',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('url');
    t.nonNull.int('pingInterval');
    t.nonNull.boolean('enabled');
    t.nonNull.list.field('emails', {
      type: nonNull('String'),
    });
  },
});
