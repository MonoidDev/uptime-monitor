import { useMemo } from 'react';

export interface Cursor {
  afterId?: number | null;
  beforeId?: number | null;
}

export interface WithId {
  id: number;
}

export interface CursorOptions {
  cursor: Cursor;
  onCursorChange: (cursor: Cursor) => void;
  data?: {
    minId?: number | null;
    maxId?: number | null;
    results: WithId[];
  };
  reversed?: true;
}

export const useCursor = (options: CursorOptions) => {
  const { onCursorChange, data } = options;

  const currentMinId = useMemo(() => Math.min(...(data?.results.map((e) => e.id) ?? [])), [data]);
  const currentMaxId = useMemo(() => Math.max(...(data?.results.map((e) => e.id) ?? [])), [data]);

  const hasMoreBefore = data?.maxId ? data.maxId > currentMaxId : false;
  const hasMoreAfter = data?.minId ? data.minId < currentMinId : false;

  const nextPage = () => {
    onCursorChange({
      beforeId: undefined,
      afterId: currentMinId,
    });
  };

  const previousPage = () => {
    onCursorChange({
      beforeId: currentMaxId,
      afterId: undefined,
    });
  };

  const setCursor = (cursor: Cursor) => {
    onCursorChange(cursor);
  };

  const resetCursor = (initialCursor: Cursor = REVERSE_INITIAL_CURSOR) => {
    onCursorChange(initialCursor);
  };

  return {
    hasMoreBefore,
    hasMoreAfter,
    nextPage,
    previousPage,
    setCursor,
    resetCursor,
  };
};

export const REVERSE_INITIAL_CURSOR: Cursor = {
  afterId: 2 ** 31 - 1,
  beforeId: undefined,
};
