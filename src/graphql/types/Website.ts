import { objectType } from 'nexus';

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
