import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull } from 'nexus';

import { Auth, loginRequired } from '../auth';
import {
  CreateUser,
  Login,
  UpdateUser,
  UpdateUserPassword,
} from '../types';
import { CreateUserSchema, UpdateUserPasswordSchema, UpdateUserSchema } from '../types/UserSchema';

export const login = mutationField('login', {
  type: 'User',
  args: {
    auth: nonNull(Login),
  },
  async resolve(_, { auth: { email, inputPassword } }, ctx) {
    const user = await ctx.prisma.user.findUnique({
      where: { email },
    });

    if (user && ctx.userService.verifyPassword(user, inputPassword)) {
      const token = await new Auth().sign(user);

      return {
        ...user,
        token,
      };
    }

    throw new UserInputError('Email or password is incorrect. ');
  },
});

export const createUser = mutationField('createUser', {
  type: 'User',
  args: {
    user: nonNull(CreateUser),
  },
  validate: {
    user: CreateUserSchema,
  },
  async resolve(_, { user }, ctx) {
    if (await ctx.userService.findUserByEmail(user.email)) {
      throw new UserInputError('Invalid args', {
        errors: {
          email: `${user?.email} is already registered`,
        },
      });
    }

    const newUser = await ctx.userService.createUser(user);
    return newUser;
  },
});

export const updateMe = mutationField('updateMe', {
  type: 'User',
  args: {
    user: nonNull(UpdateUser),
  },
  validate: {
    user: UpdateUserSchema,
  },
  authorize: loginRequired,
  async resolve(_, { user }, ctx) {
    const { id } = ctx.authInfo!;
    return ctx.userService.updateUser(id, user);
  },
});

export const updateMyPassword = mutationField('updateMyPassword', {
  type: 'User',
  args: {
    updatePassword: nonNull(UpdateUserPassword),
  },
  validate: {
    updatePassword: UpdateUserPasswordSchema,
  },
  async resolve(_, { updatePassword }, ctx) {
    return ctx.userService.updateUserPassword(
      ctx.authInfo!.id!,
      updatePassword,
    );
  },
});
