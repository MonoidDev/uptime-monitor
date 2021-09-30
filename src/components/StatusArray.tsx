import React from 'react';

import classNames from 'classnames';

export interface StatusArrayProps {
  status: ('ERROR' | 'OK' | 'UNAVAILABLE')[];
}

export const statusToClass = {
  UNAVAILABLE: 'bg-gray-500',
  OK: 'bg-green-400',
  ERROR: 'bg-red-600',
};

export const StatusArray: React.VFC<StatusArrayProps> = (props) => {
  const {
    status,
  } = props;

  return (
    <div title="The up status for past 24 hours. " className="flex space-x-1">
      {status.map((s, i) => (
        <div
          key={i}
          className={classNames('w-1 h-4', statusToClass[s])}
        />
      ))}
    </div>
  );
};
