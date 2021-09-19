import { mutationField, nonNull } from 'nexus';

import { CreateWebsite } from '../types';
import { CreateWebsiteSchema } from '../types/WebsiteSchema';

export const createWebsite = mutationField('createWebsite', {
  type: 'Website',
  args: {
    website: nonNull(CreateWebsite),
  },
  validate: {
    website: CreateWebsiteSchema,
  },
  async resolve(_, { website }, ctx) {
    const userId = ctx.authInfo!.id;
    const newWebsite = await ctx.websiteSerice.createWebsite(userId, website);
    return newWebsite;
  },
});
