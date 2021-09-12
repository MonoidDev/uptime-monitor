import { createSchema } from "../graphql/schema";

createSchema({
  emit: true,
});

console.log('GQL schema emitted.');
