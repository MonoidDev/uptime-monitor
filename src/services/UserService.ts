import { createHash } from 'crypto';

import type { User } from '@prisma/client';
import { UserInputError } from 'apollo-server';
import * as t from 'io-ts';

import { CreateUserSchema, UpdateUserSchema } from '../graphql/types/UserSchema';
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

  async updateUser(id: number, user: t.TypeOf<typeof UpdateUserSchema>) {
    const currentId = (await this.ctx.prisma.user.findUnique({
      where: { email: user.email },
    }))?.id;

    if (currentId !== id && currentId !== undefined) {
      throw new UserInputError('Invalid args', {
        errors: {
          email: `${user?.email} is already registered`,
        },
      });
    }

    return this.ctx.prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }
}
