import * as Models from './types'
import * as Queries from './queries'
import * as Mutations from './mutations'

export const resolvers = {
  ...Models,
  Query: {
    ...Queries,
  },
  Mutation: {
    ...Mutations,
  },
};
