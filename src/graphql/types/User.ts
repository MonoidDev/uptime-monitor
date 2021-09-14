import {
  createHash,
} from 'crypto';

import type { User as UserType } from '@prisma/client';
import { objectType, inputObjectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.email();
    t.model.createdAt();
    t.string('token');
  },
});

export const CreateUser = inputObjectType({
  name: 'CreateUser',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('inputPassword');
  },
});

export const userHelper = (user?: UserType) => {
  return {
    hashPassword(password: string) {
      return createHash('sha256')
        .update(password)
        .digest('base64');
    },
    verifyPassword(password: string) {
      return user?.password === this.hashPassword(password);
    },
  };
};
