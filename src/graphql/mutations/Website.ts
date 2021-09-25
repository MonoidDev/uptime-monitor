import { intArg, mutationField, nonNull } from 'nexus';

import { loginRequired } from '../auth';
import { CreateUpdateWebsite } from '../types';
import { CreateUpdateWebsiteSchema } from '../types/WebsiteSchema';

export const createWebsite = mutationField('createWebsite', {
  type: 'Website',
  authorize: loginRequired,
  args: {
    website: nonNull(CreateUpdateWebsite),
  },
  validate: {
    website: CreateUpdateWebsiteSchema,
  },
  async resolve(_, { website }, ctx) {
    const newWebsite = await ctx.websiteSerice.createWebsite(website);
    return newWebsite;
  },
});

export const updateWebsite = mutationField('updateWebsite', {
  type: 'Website',
  authorize: loginRequired,
  args: {
    websiteId: nonNull(intArg()),
    website: nonNull(CreateUpdateWebsite),
  },
  validate: {
    website: CreateUpdateWebsiteSchema,
  },
  async resolve(_, { websiteId, website }, ctx) {
    const updatedWebsite = await ctx.websiteSerice.updateWebsite(websiteId, website);
    return updatedWebsite;
  },
});

export const deleteWebsite = mutationField('deleteWebsite', {
  type: 'Website',
  authorize: loginRequired,
  args: {
    websiteId: nonNull(intArg()),
  },
  async resolve(_, { websiteId }, ctx) {
    const deletedWebsite = await ctx.websiteSerice.deleteWebsite(websiteId);
    return deletedWebsite;
  },
});
