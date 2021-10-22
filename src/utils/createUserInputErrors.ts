import { UserInputError } from 'apollo-server';
import * as t from 'io-ts';

export const createUserInputErrors = <Schema extends t.Type<any>>(
  _schema: Schema,
  errors: { [key in keyof t.TypeOf<Schema> & string]?: string },
) => {
  return new UserInputError('Invalid args', { errors });
};
