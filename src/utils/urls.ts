import { Urls } from './types';

const urlsWithoutAuth = new Set<Urls>(['/auth/createUser', '/auth/login', '/urls']);

export const urlNeedsAuth = (url: string) => {
  return !urlsWithoutAuth.has(url as Urls);
};
