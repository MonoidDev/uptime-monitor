import { mutationField, nonNull, stringArg } from 'nexus';

import { CreateUser, userHelper } from '../types';
import { Auth } from '../auth';
import { UserInputError } from 'apollo-server-errors';
import { CreateUserSchema } from '../types/UserSchema';

export const login = mutationField('login', {
  type: 'User',
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  async resolve(_, { email, password }, ctx) {
    const user = await ctx.prisma.user.findUnique({
      where: { email },
    });

    if (user && userHelper(user).verifyPassword(password)) {
      return {
        ...user,
        token: await new Auth().sign(user),
      };
    }

    throw new UserInputError('Email or password is incorrect. ');
  },
});

export const createUser = mutationField('createUser', {
  type: 'User',
  args: {
    user: CreateUser,
  },
  validate: {
    user: CreateUserSchema,
  },
  async resolve(_, { user }, ctx) {
    if ((await ctx.prisma.user.findMany({ where: { email: user?.email } })).length) {
      throw new UserInputError('Invalid args', {
        errors: {
          email: `${user?.email} is already registered`,
        },
      });
    }

    const newUser = await ctx.prisma.user.create({
      data: {
        name: user!.email.split('@')[0],
        email: user!.email,
        password: userHelper().hashPassword(user!.inputPassword),
      },
    });

    return newUser;
  },
});
