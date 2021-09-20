import { mutationField, nonNull } from 'nexus';

import { CreateTrace } from '../types';
import { CreateTraceSchema } from '../types/TraceSchema';

export const createTrace = mutationField('createTrace', {
  type: 'Trace',
  args: {
    trace: nonNull(CreateTrace),
  },
  validate: {
    trace: CreateTraceSchema,
  },
  async resolve(_, { trace }, ctx) {
    const newTrace = await ctx.traceSerice.createTrace(trace);
    return newTrace;
  },
});
