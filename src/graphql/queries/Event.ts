import { queryField, nonNull } from 'nexus';

import { loginRequired } from '../auth';

export const events = queryField('events', {
  type: nonNull('PaginatedEvents'),
  args: {
    query: nonNull('EventQuery'),
  },
  authorize: loginRequired,
  async resolve(_, { query }, ctx) {
    return ctx.eventService.findEvents(query);
  },
});
