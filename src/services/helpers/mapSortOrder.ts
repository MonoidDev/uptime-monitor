import { UserInputError } from 'apollo-server';

export const mapSortOrder = (order?: string) => {
  if (order == null) return order;

  switch (order) {
    case 'descend':
      return 'desc';
    case 'ascend':
      return 'asc';
    default:
      throw new UserInputError(`Non-null order must be one of asc, desc, got ${order}`);
  }
};
