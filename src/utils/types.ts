import { ServerResponse, IncomingMessage } from 'http';

import { UserInputError } from 'apollo-server';
import * as t from 'io-ts';

import { NexusGenInputs } from '../../graphql/server/generated';

export type NextIncomingMessage = IncomingMessage & {
  cookies?: {
    [key: string]: any,
  },
};

export type RequestHandler = (req: NextIncomingMessage, res: ServerResponse) => Promise<void>;

export type RequestObjectHandler<T = undefined> = (
  (o: { req: NextIncomingMessage, res: ServerResponse }) => Promise<T>
);

export type InputObjectNames = keyof NexusGenInputs;

export const defineSchema = <
  TypeName extends InputObjectNames,
  Schema = t.Type<NexusGenInputs[TypeName]>,
>(
    _typeName: TypeName,
    schema: Schema,
  ) => schema;

export * from '../../.next-urls';

export const mapSortOrder = (order?: string) => {
  if (order == null) return order;

  switch (order) {
    case 'descend': return 'desc';
    case 'ascend': return 'asc';
    default:
      throw new UserInputError('Invalid sort order', {
        errors: {
          order: `Non-null order must be one of asc, desc, got ${order}`,
        },
      });
  }
};
