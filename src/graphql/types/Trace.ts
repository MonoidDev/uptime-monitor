import { objectType, inputObjectType, enumType } from 'nexus';

export const Trace = objectType({
  name: 'Trace',
  definition(t) {
    t.model.id();
    t.model.traceType();
    t.model.website();
    t.model.websiteId();
    t.model.duration();
    t.model.status();
    t.model.requestHeaders();
    t.model.responseHeaders();
    t.model.responseData();
    t.model.createdAt();
  },
});

export const TraceOfError = objectType({
  name: 'TraceOfError',
  definition(t) {
    t.string('time_range');
    t.int('count');
  },
});

const TraceTypeChoices = enumType({
  name: 'TraceTypeChoices',
  members: ['PING'],
});

const TraceStatusChoices = enumType({
  name: 'TraceStatusChoices',
  members: ['OK', 'TIMEOUT', 'HTTP_ERROR', 'SSL_ERROR'],
});

export const CreateTrace = inputObjectType({
  name: 'CreateTrace',
  definition(t) {
    t.nonNull.field('traceType', { type: TraceTypeChoices });
    t.nonNull.int('websiteId');
    t.nonNull.int('duration');
    t.nonNull.field('status', { type: TraceStatusChoices });
    t.nonNull.string('requestHeaders');
    t.nonNull.string('responseHeaders');
    t.nonNull.string('responseData');
  },
});
