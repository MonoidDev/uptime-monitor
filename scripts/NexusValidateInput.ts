import { UserInputError } from 'apollo-server-errors';
import * as t from 'io-ts';
import { plugin } from 'nexus';
import { printedGenTyping, printedGenTypingImport } from 'nexus/dist/core';

import { createValidate } from '../src/utils/createValidate';

const NexusValidateInputImport = printedGenTypingImport({
  module: __filename.replace(/\.ts$/, ''),
  bindings: ['NexusValidateInputSchemas'],
});

export type NexusValidateInputSchemas = {
  [key in string]: t.Type<any>;
};

export type NexusNestedError = {
  [key in string]: string | NexusNestedError;
};

export type NexusValidateError = {
  [arg in string]: NexusNestedError;
};

const fieldDefTypes = printedGenTyping({
  optional: true,
  name: 'validate',
  description: 'Validation Arguments with io-ts',
  type: 'NexusValidateInputSchemas',
  imports: [NexusValidateInputImport],
});

export const nexusValidateInput = () => {
  return plugin({
    name: 'NexusValidateInput',
    fieldDefTypes,
    onCreateFieldResolver(config) {
      return function resolver(source, args, context, info, next) {
        const schemas = config.fieldConfig
          .extensions?.nexus?.config.validate as NexusValidateInputSchemas | undefined;

        const errors: NexusValidateError = {};

        if (schemas) {
          for (const [key, schema] of Object.entries(schemas)) {
            const validate = createValidate(schema);
            const e = validate(args[key]);
            if (Object.keys(e).length) {
              errors[key] = e;
            }
          }
        }

        if (Object.keys(errors).length) {
          throw new UserInputError('Invalid args', {
            errors,
          });
        }

        return next(source, args, context, info);
      };
    },
  });
};
