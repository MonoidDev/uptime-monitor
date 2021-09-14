import { fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';

export const createValidate = (type: t.Type<any>) => (values: any) => {
  const v = type.decode(values);
  const errors = pipe(
    v,
    fold(
      (errs: any) => errs.map(
        (error: any) => [
          error.context.map(({ key }: any) => key).filter(Boolean),
          error.message,
        ] as const,
      ),
      () => [],
    ),
  );

  const o: any = {};
  for (const [keys, message] of errors) {
    let cur = o;
    let i = 0;
    for (const key of keys) {
      cur[key] = cur[key] === undefined ? {} : cur[key];
      if (i < keys.length - 1) {
        i++;
        cur = cur[key];
      }
    }
    cur[keys[keys.length - 1]] = message;
  }

  return o;
};
