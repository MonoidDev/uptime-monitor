import * as t from 'io-ts';
import { useRouter } from 'next/router';

export const usePageQuery = <T extends {}>(type: t.Type<T>) => {
  const { query } = useRouter();

  const e = type.decode(query);

  // eslint-disable-next-line no-underscore-dangle
  if (e._tag === 'Left') {
    throw new Error('Invalid page query. ');
  } else {
    return e.right;
  }
};
