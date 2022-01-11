import type { TraceStatus } from '@prisma/client';
import { TraceStatusChoices } from 'graphql/client/generated';

export const allTraceStatus = Object.values(TraceStatusChoices);

export const traceStatusToColor: { [key in TraceStatus]: string } = {
  OK: 'text-green-400',
  TIMEOUT: 'text-yellow-400',
  HTTP_ERROR: 'text-red-600',
  SSL_ERROR: 'text-red-600',
  DNS_ERROR: 'text-red-600',
  IO_ERROR: 'text-red-600',
  INTERNAL_ERROR: 'text-red-600',
};
