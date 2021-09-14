import * as h from 'tyrann-io';

import { createStrings } from './local';

export const formStrings = createStrings({
  en: {
    notEmpty: (name: string) => `${name} is required.`,
    tooLong: (name: string, n: number) => `${name} must be within ${n} characters.`,
    tooShort: (name: string, n: number) => `${name} must be at least ${n} characters.`,
    invalid: (name: string) => `${name} is invalid`,
  },
});

export const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export const newEmailField = (label: string) => {
  return h.string()
    .withLabel(label)
    .min(1, formStrings.notEmpty(label))
    .max(64, formStrings.tooLong(label, 64))
    .matches(emailRegex, formStrings.invalid(label));
};

export const newPasswordField = (label: string) => {
  return h.string()
    .withLabel(label)
    .min(8, formStrings.tooShort(label, 8))
    .max(64, formStrings.tooLong(label, 64));
  // TODO: Password verification
};
