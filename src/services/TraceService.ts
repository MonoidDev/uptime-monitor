import * as t from 'io-ts';

import { CreateTraceSchema } from '../graphql/types/TraceSchema';
import { BaseService } from './BaseService';

export class TraceService extends BaseService {
  async findTraceById(id: number) {
    return this.ctx.prisma.trace.findUnique({
      where: {
        id,
      },
      include: {
        website: true,
      },
    });
  }

  async findTraces(afterId: number) {
    return this.ctx.prisma.trace.findMany({
      where: {
        id: {
          lt: afterId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  createTrace(trace: t.TypeOf<typeof CreateTraceSchema>) {
    return this.ctx.prisma.trace.create({
      data: {
        traceType: trace!.traceType,
        websiteId: trace!.websiteId,
        duration: trace!.duration,
        status: trace!.status,
        requestHeaders: trace!.requestHeaders,
        responseHeaders: trace!.responseHeaders,
        responseData: trace!.responseData,
      },
    });
  }
}
