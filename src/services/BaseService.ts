import type { Context } from '../graphql/context';

export class BaseService {
  constructor(protected getContext: () => Context) {}

  get ctx() {
    return this.getContext();
  }
}
