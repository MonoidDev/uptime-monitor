import { useState } from 'react';

import { unstable_batchedUpdates } from 'react-dom';

export interface PaginationProps {
  maxId?: number | null | undefined,
  minId?: number | null | undefined,
  results: {
    id: number,
  }[]
}

export const usePagination = () => {
  const [afterId, setAfterId] = useState<number | undefined>(2 ** 31 - 1);
  const [beforeId, setBeforeId] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<PaginationProps | undefined | null>(undefined);

  const currentMinId = Math.min(...items?.results.map((item) => item.id) ?? []);
  const currentMaxId = Math.max(...items?.results.map((item) => item.id) ?? []);

  return {
    afterId,
    beforeId,
    hasMoreBefore: (items?.maxId ?? 0) > currentMaxId,
    hasMoreAfter: (items?.minId ?? 0) < currentMinId,
    async updatePagination(i: PaginationProps | undefined | null) {
      setItems(i);
    },
    async onClickAfter() {
      unstable_batchedUpdates(() => {
        setBeforeId(undefined);
        setAfterId(currentMinId);
      });
    },
    async onClickBefore() {
      unstable_batchedUpdates(() => {
        setBeforeId(currentMaxId);
        setAfterId(undefined);
      });
    },
    async onReset() {
      unstable_batchedUpdates(() => {
        setBeforeId(undefined);
        setAfterId(2 ** 31 - 1);
      });
    },
  };
};
