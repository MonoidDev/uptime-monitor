import React from 'react';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export interface CursorPaginationProps {
  hasMoreBefore?: boolean;
  hasMoreAfter?: boolean;
  onClickBefore?: () => void;
  onClickAfter?: () => void;
}

export const CursorPagination: React.VFC<CursorPaginationProps> = (props) => {
  const { hasMoreBefore = true, hasMoreAfter = true, onClickBefore, onClickAfter } = props;

  return (
    <div className="flex gap-2">
      <Button disabled={!hasMoreBefore} icon={<LeftOutlined />} onClick={onClickBefore} />
      <Button disabled={!hasMoreAfter} icon={<RightOutlined />} onClick={onClickAfter} />
    </div>
  );
};
