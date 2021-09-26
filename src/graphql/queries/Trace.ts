import {
  queryField, nonNull, intArg, list,
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
