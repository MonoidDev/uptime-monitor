import React from 'react';

interface TraceDataCellProps {
  label: string;
}

export const TraceDataCell: React.FC<TraceDataCellProps> = (props) => {
  const {
    children,
    label,
  } = props;

  return (
    <p className="flex justify-between py-1.5">
      <div>
        {' '}
        {label}
        {' '}
      </div>
      <div className="bg-gray-200 pl-2 py-0.5 w-3/4 rounded-md">
        {children}
      </div>
    </p>
  );
};
