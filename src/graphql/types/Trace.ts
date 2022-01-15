import { TraceStatus } from '@prisma/client';
import { objectType, inputObjectType, enumType, nonNull } from 'nexus';

export const Trace = objectType({
  name: 'Trace',
  definition(t) {
    t.model.id();
    t.model.traceType();
    t.model.website();
    t.model.websiteId();
    t.model.duration();
    t.model.status();
    t.model.httpStatusCode();
    t.model.requestHeaders();
    t.model.responseHeaders();
    t.model.responseData();
    t.model.createdAt();
  },
});

export const TraceOfError = objectType({
  name: 'TraceOfError',
  definition(t) {
    t.nonNull.string('time');
    t.nonNull.int('groupId');
    t.nonNull.int('count');
  },
});

export const TraceOfResponseTime = objectType({
  name: 'TraceOfResponseTime',
  definition(t) {
    t.nonNull.string('time');
    t.nonNull.int('groupId');
    t.nonNull.int('avgDuration');
  },
});

export const TraceOfErrorWebsite = objectType({
  name: 'TraceOfErrorWebsite',
  definition(t) {
    t.nonNull.string('time');
    t.nonNull.int('groupId');
    t.nonNull.int('websiteCount');
  },
});

const TraceTypeChoices = enumType({
  name: 'TraceTypeChoices',
  members: ['PING'],
});

export const allTraceStatus: TraceStatus[] = [
  'OK',
  'TIMEOUT',
  'HTTP_ERROR',
  'SSL_ERROR',
  'DNS_ERROR',
  'IO_ERROR',
  'INTERNAL_ERROR',
];

const TraceStatusChoices = enumType({
  name: 'TraceStatusChoices',
  members: allTraceStatus,
});

export const CreateTrace = inputObjectType({
  name: 'CreateTrace',
  definition(t) {
    t.nonNull.field('traceType', { type: TraceTypeChoices });
    t.nonNull.int('websiteId');
    t.nonNull.int('duration');
    t.nonNull.field('status', { type: TraceStatusChoices });
    t.nonNull.int('httpStatusCode');
    t.nonNull.string('requestHeaders');
    t.nonNull.string('responseHeaders');
    t.nonNull.string('responseData');
  },
});

export const PaginatedTraces = objectType({
  name: 'PaginatedTraces',
  definition(t) {
    t.int('minId');
    t.int('maxId');
    t.nonNull.list.field('results', {
      type: nonNull('Trace'),
    });
  },
});

export const TraceQuery = inputObjectType({
  name: 'TraceQuery',
  definition(t) {
    t.int('afterId');
    t.int('beforeId');
    t.boolean('isError');
    t.int('websiteId');
    t.string('rangeTime');
    t.string('timeBefore');
    t.string('timeAfter');
    t.list.field('status', {
      type: nonNull('String'),
    });
    t.list.field('websiteIds', {
      type: nonNull('Int'),
    });
  },
});
