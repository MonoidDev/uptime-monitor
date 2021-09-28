import dayjs from 'dayjs';
import range from 'lodash/range';

import { Context } from '../src/graphql/context';
import { prisma } from '../src/lib/prisma';
import { TraceService } from '../src/services/TraceService';
import { UserService } from '../src/services/UserService';
import { WebsiteService } from '../src/services/WebsiteService';

if (process.env.NODE_ENV === 'production') {
  throw new Error('seed.ts is only for development!');
}

(async () => {
  await prisma.$queryRaw('TRUNCATE TABLE "User" CASCADE;');

  function getContext() {
    return ctx;
  }

  const ctx: Context = {
    prisma,
    isLoggedIn: false,
    userService: new UserService(getContext),
    websiteService: new WebsiteService(getContext),
    traceService: new TraceService(getContext),
    req: {} as any,
    res: {} as any,
  };

  const user = await ctx.userService.createUser({
    email: 'django@gmail.com',
    inputPassword: '123123123',
  });

  ctx.authInfo = {
    id: user.id,
    isAdmin: false,
  } as any;

  const n = 1000;

  const website = await prisma.website.create({
    data: {
      userId: user.id,
      name: 'Baidu',
      url: 'https://www.baidu.com',
      pingInterval: 10,
      enabled: false,
      emails: ['wangchenyu2017@gmail.com'],
      createdAt: dayjs().subtract(((n - 31) * ((3600 * 24) * 31)) / n, 'seconds').toISOString(),
    },
  });

  for (const i of range(0, n)) {
    const date = dayjs().subtract(((n - i) * ((3600 * 24) * 31)) / n, 'seconds');
    await prisma.trace.create({
      data: {
        traceType: 'PING',
        websiteId: website.id,
        status: Math.random() < 0.3 ? 'HTTP_ERROR' : 'OK',
        duration: Math.floor(Math.random() * 100 + 200),
        createdAt: date.toDate(),
        userId: user.id,
      },
    });
  }

  const website2 = await prisma.website.create({
    data: {
      userId: user.id,
      name: 'Sougou',
      url: 'https://www.zhihu.com',
      pingInterval: 10,
      enabled: false,
      emails: ['wangchenyu2017@gmail.com'],
      createdAt: dayjs().subtract(((n - 31) * ((3600 * 24) * 15)) / n, 'seconds').toISOString(),
    },
  });

  for (const i of range(0, n)) {
    const date = dayjs().subtract(((n - i) * ((3600 * 24) * 15)) / n, 'seconds');
    await prisma.trace.create({
      data: {
        traceType: 'PING',
        websiteId: website2.id,
        status: Math.random() < 0.2 ? 'HTTP_ERROR' : 'OK',
        duration: Math.floor(Math.random() * 100 + 300),
        createdAt: date.toDate(),
        userId: user.id,
      },
    });
  }

  await prisma.$disconnect();
})();
