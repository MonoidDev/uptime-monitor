import * as t from 'io-ts';

import {
  requiredStringField, requiredNumberField, booleanField, emailArrayField,
} from '../../utils/fields';
import { defineSchema } from '../../utils/types';

export const CreateUpdateWebsiteSchema = defineSchema(
  'CreateUpdateWebsite',
  t.interface({
    name: requiredStringField('Name'),
    url: requiredStringField('Url'),
    pingInterval: requiredNumberField('Ping Interval (s)'),
    enabled: booleanField('Enable Monitoring'),
    emails: emailArrayField('Emails'),
  }),
);
