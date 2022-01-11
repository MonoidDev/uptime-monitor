export interface BaseCursorQuery {
  beforeId?: number | null;
  afterId?: number | null;
}

export const createCursorQuery = (query: BaseCursorQuery, _order = 'reversed') => {
  const { beforeId, afterId } = query;

  const cursorWhere = {
    ...(afterId !== undefined &&
      afterId !== null && {
        id: {
          lt: afterId,
        },
      }),
    ...(beforeId !== undefined &&
      beforeId !== null && {
        id: {
          gt: beforeId,
        },
      }),
  };

  const orderBy = {
    id: afterId ? ('desc' as const) : ('asc' as const),
  };

  return {
    cursorWhere,
    orderBy,
  };
};
