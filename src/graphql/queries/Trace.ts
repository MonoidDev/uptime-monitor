import {
  queryField, nonNull, intArg, list, stringArg,
} from 'nexus';

import { loginRequired } from '../auth';

export const trace = queryField('trace', {
  type: 'Trace',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    return ctx.traceService.findTraceById(id);
  },
});

export const traces = queryField('traces', {
  type: list('Trace'),
  args: {
    afterId: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { afterId }, ctx) {
    return ctx.traceService.findTraces(afterId);
  },
});

export const traceOfErrorCount = queryField('traceOfErrorCount', {
  type: list(nonNull('TraceOfError')),
  args: {
    rangeTime: nonNull(stringArg()),
    websiteId: intArg(),
  },
  authorize: loginRequired,
  async resolve(_, { rangeTime, websiteId }, ctx) {
    return ctx.traceService.findErrorCountGroupByDate(rangeTime, websiteId);
  },
});

export const traceOfResponseTime = queryField('traceOfResponseTime', {
  type: list(nonNull('TraceOfResponseTime')),
  args: {
    rangeTime: nonNull(stringArg()),
  },
  authorize: loginRequired,
  async resolve(_, { rangeTime }, ctx) {
    return ctx.traceService.findAverageDurationGroupByDate(rangeTime);
  },
});
