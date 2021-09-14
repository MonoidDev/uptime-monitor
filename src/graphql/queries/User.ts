import { queryField, nonNull, intArg } from 'nexus';
import { resolve } from 'path/posix';
import { loginRequired } from '../auth';
import { userHelper } from '../types';

export const user = queryField('user', {
  type: 'User',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    return ctx.prisma.user.findUnique({
      where: { id },
    });
  },
});

export const me = queryField('me', {
  type: 'User',
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.authInfo?.id!,
      },
    });
  }
});
