import React from 'react';

import classNames from 'classnames';

export interface TraceDataCellProps {
  label: string;
  children: React.ReactNode | (() => React.ReactNode);
  className?: string;
  multilines?: boolean;
}

export const TraceDataCell: React.FC<TraceDataCellProps> = (props) => {
  const { label, children, className = '', multilines = false } = props;

  return (
    <p>
      <div className="flex justify-between py-1.5">
        <div> {label} </div>
        {!multilines && (
          <div className={classNames('bg-gray-200 px-2 py-0.5 w-3/4 rounded-md', className)}>
            {children}
          </div>
        )}
      </div>
      {multilines && (
        <div
          className={classNames(
            'bg-gray-200 px-2 py-0.5 w-full overflow-y-auto h-20 rounded-md whitespace-pre',
            className,
          )}
        >
          {children}
        </div>
      )}
    </p>
  );
};
