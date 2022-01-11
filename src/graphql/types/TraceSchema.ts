import * as t from 'io-ts';

import {
  requiredStringField,
  requiredNumberField,
  traceTypeField,
  traceStatusField,
} from '../../utils/fields';
import { defineSchema } from '../../utils/types';

export const CreateTraceSchema = defineSchema(
  'CreateTrace',
  t.interface({
    traceType: traceTypeField,
    websiteId: requiredNumberField('websiteId'),
    duration: requiredNumberField('duration'),
    status: traceStatusField,
    httpStatusCode: requiredNumberField('httpStatusCode'),
    requestHeaders: requiredStringField('requestHeaders'),
    responseHeaders: requiredStringField('responseHeaders'),
    responseData: requiredStringField('responseData'),
  }),
);
