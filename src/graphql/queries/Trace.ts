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
    return ctx.traceSerice.findTraceById(id);
  },
});

export const traces = queryField('traces', {
  type: list('Trace'),
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.traceSerice.findTraces();
  },
});
