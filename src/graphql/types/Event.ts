import {
  objectType, inputObjectType, nonNull, enumType,
} from 'nexus';

export const SeverityType = enumType({
  name: 'SeverityType',
  members: ['LOG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
});

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.model.id();
    t.model.type();
    t.model.status();
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
    t.string('timeBefore');
    t.string('timeAfter');
  },
});
