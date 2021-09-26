import React from 'react';

export interface StatusArrayProps {
  status: ('ERROR' | 'OK' | 'UNKNOWN')[];
}

export const StatusArray: React.VFC<StatusArrayProps> = (props) => {
  const {
    status,
  } = props;

  return (
    <div className="flex space-x-1">
      {status.map((s, i) => ({
        ERROR: (
          <div
            key={i}
            className="w-1 h-4 bg-gray-500"
          />
        ),
        OK: (
          <div
            key={i}
            className="w-1 h-4 bg-green-400"
          />
        ),
        UNKNOWN: (
          <div
            key={i}
            className="w-1 h-4 bg-red-600"
          />
        ),
      }[s]))}
    </div>
  );
};
