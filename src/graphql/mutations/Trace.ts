import { mutationField, nonNull } from 'nexus';

import { loginRequired } from '../auth';
import { CreateTrace } from '../types';
import { CreateTraceSchema } from '../types/TraceSchema';

export const createTrace = mutationField('createTrace', {
  type: 'Trace',
  authorize: loginRequired,
  args: {
    trace: nonNull(CreateTrace),
  },
  validate: {
    trace: CreateTraceSchema,
  },
  async resolve(_, { trace }, ctx) {
    const newTrace = await ctx.traceService.createTrace(trace);
    return newTrace;
  },
});
