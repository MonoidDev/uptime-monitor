import {
  queryField, nonNull, intArg, stringArg,
} from 'nexus';

import { loginRequired } from '../auth';

export const website = queryField('website', {
  type: 'Website',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    return ctx.websiteService.findWebsiteById(id);
  },
});

export const websites = queryField('websites', {
  type: 'PaginatedWebsite',
  args: {
    page: nonNull(intArg()),
    keyword: stringArg(),
  },
  authorize: loginRequired,
  async resolve(_, { page, keyword }, ctx) {
    const count = await ctx.websiteService.total(keyword);
    const queryResult = await ctx.websiteService.findWebsites(page, keyword);
    const results = await Promise.all(queryResult.map((w) => ({
      status: ctx.websiteService.findWebsiteStatus(w.id),
      ...w,
    })));
    return {
      count,
      results,
    };
  },
});

export const firstWebsite = queryField('firstWebsite', {
  type: 'Website',
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.websiteService.findFirstWebsite();
  },
});
