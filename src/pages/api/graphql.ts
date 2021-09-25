import { ApolloServer } from 'apollo-server-micro';
import { PageConfig } from 'next';

import { createContext } from '../../graphql/context';
import { createSchema } from '../../graphql/schema';
// import MyScheduler from '../../lib/my-scheduler';
import { RequestHandler } from '../../utils/types';

const apolloServer = new ApolloServer({
  context: createContext,
  schema: createSchema({
    emit: false,
  }),
  debug: true,
  introspection: true,
});

const startServer = apolloServer.start();

if (process.env.NODE_ENV === 'production' || (global as any).MyScheduler === undefined) {
  // MyScheduler.enable();
  // (global as any).MyScheduler = MyScheduler;
}

export default (async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Auth, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await startServer;

  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);

  return undefined;
}) as RequestHandler;

// Apollo Server Micro takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
