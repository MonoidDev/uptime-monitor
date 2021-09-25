import {
  queryField, nonNull, intArg, list,
} from 'nexus';

import { loginRequired } from '../auth';

export const website = queryField('website', {
  type: 'Website',
  args: {
    id: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { id }, ctx) {
    return ctx.websiteSerice.findWebsiteById(id);
  },
});

export const websites = queryField('websites', {
  type: list('Website'),
  args: {
    afterId: nonNull(intArg()),
  },
  authorize: loginRequired,
  async resolve(_, { afterId }, ctx) {
    return ctx.websiteSerice.findWebsites(afterId);
  },
});
