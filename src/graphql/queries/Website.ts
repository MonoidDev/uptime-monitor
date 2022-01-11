import { queryField, nonNull, intArg, stringArg, list } from 'nexus';

import { loginRequired } from '../auth';

export const website = queryField('website', {
  type: 'Website',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    const w = await ctx.websiteService.findWebsiteById(id);
    return (
      w && {
        ...w,
        status: await ctx.websiteService.findWebsiteStatus(id),
      }
    );
  },
});

export const websites = queryField('websites', {
  type: 'PaginatedWebsite',
  args: {
    page: nonNull(intArg()),
    pageSize: nonNull(intArg()),
    sortByName: stringArg(),
    keyword: stringArg(),
  },
  authorize: loginRequired,
  async resolve(_, { page, pageSize, keyword, sortByName }, ctx) {
    const count = await ctx.websiteService.total(keyword);
    const queryResult = await ctx.websiteService.findWebsites(page, pageSize, keyword, sortByName);
    const results = await Promise.all(
      queryResult.map(async (w) => ({
        status: await ctx.websiteService.findWebsiteStatus(w.id),
        ...w,
      })),
    );
    return {
      count,
      results,
    };
  },
});

export const userWebsites = queryField('userWebsites', {
  type: nonNull(list(nonNull('Website'))),
  args: {},
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.websiteService.findUserWebsites();
  },
});

export const firstWebsite = queryField('firstWebsite', {
  type: 'Website',
  authorize: loginRequired,
  async resolve(_, __, ctx) {
    return ctx.websiteService.findFirstWebsite();
  },
});
