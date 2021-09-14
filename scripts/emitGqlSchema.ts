import { createSchema } from '../src/graphql/schema';

createSchema({
  emit: true,
});

console.info('GQL schema emitted.');
