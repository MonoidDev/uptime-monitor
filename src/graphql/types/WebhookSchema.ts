import { requiredStringField } from 'app/utils/fields';
import { defineSchema } from 'app/utils/types';
import * as t from 'io-ts';

export const CreateWebhookSchema = defineSchema(
  'CreateWebhook',
  t.interface({
    name: requiredStringField('Name'),
    type: requiredStringField('Type'),
    url: requiredStringField('URL'),
  }),
);
