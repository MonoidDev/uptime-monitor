import { queryField, nonNull, intArg } from 'nexus';

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
