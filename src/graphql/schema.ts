import { join } from 'path';

import { makeSchema, fieldAuthorizePlugin } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';

import { nexusValidateInput } from '../../scripts/NexusValidateInput';
import * as types from './resolvers';

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
        'graphql', 'server', 'generated', 'index.d.ts',
      ),
      schema: join(process.cwd(), 'graphql', 'schema.graphql'),
    },
    contextType: {
      export: 'Context',
      module: join(process.cwd(), 'src', 'graphql', 'context.ts'),
    },
    sourceTypes: {
      modules: [
        {
          // eslint-disable-next-line no-eval
          module: eval("require.resolve('.prisma/client/index.d.ts')"),
          // Escape webpack from handling it
          alias: 'prisma',
        },
      ],
    },
    plugins: [
      fieldAuthorizePlugin(),
      nexusPrisma({ experimentalCRUD: true }),
      nexusValidateInput(),
    ],
  });
};
