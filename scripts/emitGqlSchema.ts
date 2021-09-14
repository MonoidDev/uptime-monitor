import { createSchema } from "../src/graphql/schema";

createSchema({
  emit: true,
});

console.log('GQL schema emitted.');
