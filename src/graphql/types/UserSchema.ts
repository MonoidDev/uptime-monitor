import * as t from 'io-ts';

import { newEmailField, newPasswordField } from '../../utils/forms';
import { defineSchema } from '../../utils/types';

export const CreateUserSchema = defineSchema(
  'CreateUser',
  t.interface({
    email: newEmailField('Email'),
    inputPassword: newPasswordField('Password'),
  }),
);
