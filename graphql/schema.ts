import { makeSchema, fieldAuthorizePlugin } from "nexus";
import { join } from "path";
import * as types from "./resolvers";

export interface CreateSchemaOptions {
  emit?: boolean;
}

export const createSchema = (options: CreateSchemaOptions = {}) => {
  const {
    emit = false,
  } = options;

  return makeSchema({
    types,
    shouldGenerateArtifacts: emit,
    outputs: {
      typegen: join(
        process.cwd(),
        "node_modules", "@types", "nexus-typegen", "index.d.ts",
      ),
      schema: join(process.cwd(), "graphql", "schema.graphql"),
    },
    contextType: {
      export: "Context",
      module: join(process.cwd(), "graphql", "context.ts"),
    },
    plugins: [
      fieldAuthorizePlugin(),
    ],
  });
};
