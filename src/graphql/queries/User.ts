import {
  queryField, nonNull, intArg, list,
} from 'nexus';

import { loginRequired } from '../auth';

export const user = queryField('user', {
  type: 'User',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    return ctx.userService.findUserById(id);
  },
});

export const me = queryField('me', {
  type: 'User',
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.userService.findUserById(ctx.authInfo!.id);
  },
});

export const allUsers = queryField('allUsers', {
  type: list('User'),
  async resolve(_, __, ctx) {
    return [await ctx.userService.findUserById(1)];
  },
});
