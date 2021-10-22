import { createHash } from 'crypto';

import type { User } from '@prisma/client';
import { createUserInputErrors } from 'app/utils/createUserInputErrors';
import * as t from 'io-ts';

import { CreateUserSchema, UpdateUserPasswordSchema, UpdateUserSchema } from '../graphql/types/UserSchema';
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
      throw createUserInputErrors(
        UpdateUserSchema,
        {
          email: `${user?.email} is already registered`,
        },
      );
    }

    return this.ctx.prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }

  async updateUserPassword(id: number, updatePassword: t.TypeOf<typeof UpdateUserPasswordSchema>) {
    if (updatePassword.newPassword !== updatePassword.newPasswordRepeated) {
      throw createUserInputErrors(UpdateUserPasswordSchema, {
        newPasswordRepeated: 'Sorry, please confirm your password again. ',
      });
    }

    const user = await this.findUserById(id);

    if (!user || !this.verifyPassword(user, updatePassword.currentPassword)) {
      throw createUserInputErrors(UpdateUserPasswordSchema, {
        currentPassword: 'Sorry, your current password is incorrect. ',
      });
    }

    return this.ctx.prisma.user.update({
      where: { id },
      data: {
        password: this.hashPassword(updatePassword.newPassword),
      },
    });
  }
}
