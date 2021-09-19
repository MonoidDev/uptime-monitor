import { createHash } from 'crypto';

import type { User } from '@prisma/client';
import * as t from 'io-ts';

import { CreateUserSchema } from '../graphql/types/UserSchema';
import { BaseService } from './BaseService';

export class UserService extends BaseService {
  async findUserById(id: number) {
    return this.ctx.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.ctx.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // TODO: salt?
  hashPassword(password: string) {
    return createHash('sha256')
      .update(password)
      .digest('base64');
  }

  verifyPassword(user: User, inputPassword: string) {
    return user.password === this.hashPassword(inputPassword);
  }

  createUser(user: t.TypeOf<typeof CreateUserSchema>) {
    return this.ctx.prisma.user.create({
      data: {
        name: user!.email.split('@')[0],
        email: user!.email,
        password: this.hashPassword(user!.inputPassword),
      },
    });
  }
}
