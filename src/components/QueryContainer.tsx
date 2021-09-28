import React from 'react';

import type { QueryResult } from '@apollo/client';
import { Spin } from 'antd';
import classNames from 'classnames';

export interface QueryContainerProps {
  queries?: QueryResult<any, any>[];
  children: React.ReactNode | (() => React.ReactNode);
  renderError?: () => React.ReactNode;
  className?: string;
  isNotFound?: boolean;
}

export const QueryContainer: React.FC<QueryContainerProps> = (props) => {
  const {
    queries = [],
    children,
    renderError,
    className,
    isNotFound = false,
  } = props;

  const isSuccessfull = queries.every((q) => q.data !== undefined);
  const isLoading = queries.some((q) => q.loading);
  const isFailed = queries.some((q) => q.error);

  const renderChildren = () => {
    if (typeof children === 'function') return children();
    return children;
  };

  const divClass = classNames('h-full flex justify-center items-center', className);

  return (
    <>
      {isSuccessfull && renderChildren()}
      {isFailed && (
        renderError?.() ?? (
          <div className={divClass}>
            Sorry, there is an error!
          </div>
        )
      )}
      {isLoading && (
        <div className={divClass}>
          <Spin />
        </div>
      )}
      {isNotFound && (
        <div className={divClass}>
          Sorry, nothing to show here!
        </div>
      )}
    </>
  );
};
