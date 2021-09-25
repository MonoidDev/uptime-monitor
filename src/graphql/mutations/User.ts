import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull } from 'nexus';

import { Auth } from '../auth';
import { CreateUser, Login } from '../types';
import { CreateUserSchema } from '../types/UserSchema';

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
