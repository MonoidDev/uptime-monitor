import {
  objectType, inputObjectType, nonNull,
} from 'nexus';

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.model.id();
    t.model.type();
    t.model.website();
    t.model.websiteId();
    t.model.traceId();
    t.model.data();
    t.model.createdAt();
  },
});

export const PaginatedEvents = objectType({
  name: 'PaginatedEvents',
  definition(t) {
    t.int('minId');
    t.int('maxId');
    t.nonNull.list.field('results', {
      type: nonNull('Event'),
    });
  },
});

export const EventQuery = inputObjectType({
  name: 'EventQuery',
  definition(t) {
    t.int('afterId');
    t.int('beforeId');
    t.int('websiteId');
    t.string('rangeTime');
  },
});
