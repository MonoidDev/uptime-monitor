import * as t from 'io-ts';
import type { NextApiRequest, NextApiResponse } from 'next';

import { NexusGenInputs } from '../../graphql/server/generated';

export type RequestHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export type RequestObjectHandler<T = undefined> = (o: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => Promise<T>;

export type InputObjectNames = keyof NexusGenInputs;

export const defineSchema = <
  TypeName extends InputObjectNames,
  Schema = t.Type<NexusGenInputs[TypeName]>,
>(
  _typeName: TypeName,
  schema: Schema,
) => schema;

export * from '../../.next-urls';
