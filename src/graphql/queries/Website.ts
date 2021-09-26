import {
  queryField, nonNull, intArg,
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
  },
  authorize: loginRequired,
  async resolve(_, { page }, ctx) {
    const count = await ctx.websiteService.total();
    const results = await ctx.websiteService.findWebsites(page);
    return {
      count,
      results,
    };
  },
});
