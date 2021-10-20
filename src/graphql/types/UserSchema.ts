import * as t from 'io-ts';

import { emailField, newPasswordField, requiredStringField } from '../../utils/fields';
import { defineSchema } from '../../utils/types';

export const CreateUserSchema = defineSchema(
  'CreateUser',
  t.interface({
    email: emailField('Email'),
    inputPassword: newPasswordField('Password'),
  }),
);

export const LoginSchema = defineSchema(
  'Login',
  t.interface({
    email: emailField('Email'),
    inputPassword: requiredStringField('Password'),
  }),
);

export const UpdateUserSchema = defineSchema(
  'UpdateUser',
  t.interface({
    email: emailField('Email'),
    name: requiredStringField('Name'),
  }),
);
