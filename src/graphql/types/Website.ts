import { objectType, inputObjectType } from 'nexus';

export const Website = objectType({
  name: 'Website',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.url();
    t.model.pingInterval();
    t.model.userId();
  },
});

export const CreateWebsite = inputObjectType({
  name: 'CreateWebsite',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('url');
    t.nonNull.int('pingInterval');
  },
});
