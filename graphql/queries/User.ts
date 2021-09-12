import { queryField, nonNull, intArg } from 'nexus';

export const user = queryField('user', {
  type: 'User',
  args: {
    id: nonNull(intArg()),
  },
  authorize: () => false,
  async resolve(_parent, { id }, ctx) {
    return ctx.prisma.user.findUnique({
      where: { id },
    }).then((u) => ({
      ...u,
      createdAt: u?.createdAt.getTime(),
    }));
  },
});
