import * as t from 'io-ts';
import * as h from 'tyrann-io';

import {
  requiredStringField,
  requiredURLField,
  requiredNumberField,
  booleanField,
  emailArrayField,
} from '../../utils/fields';
import { defineSchema } from '../../utils/types';

export const CreateUpdateWebsiteSchema = defineSchema(
  'CreateUpdateWebsite',
  t.interface({
    name: requiredStringField('Name'),
    url: requiredURLField('Website URL'),
    pingInterval: requiredNumberField('Ping Interval (s)'),
    enabled: booleanField('Enable Monitoring'),
    emails: emailArrayField('Emails'),
    errorPredicate: requiredStringField('Error Predicate'),
    webhookIds: h.array(t.number).withLabel('Webhooks'),
  }),
);
