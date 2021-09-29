import React from 'react';

interface TraceDataCellProps {
  label: string;
  multilines?: boolean;
}

export const TraceDataCell: React.FC<TraceDataCellProps> = (props) => {
  const {
    children,
    label,
    multilines,
  } = props;

  return (
    <p>
      <div className="flex justify-between py-1.5">
        <div>
          {' '}
          {label}
          {' '}
        </div>
        {!multilines && (
        <div className="bg-gray-200 px-2 py-0.5 w-3/4 rounded-md">
          {children}
        </div>
        )}
      </div>
      {multilines && (
        <div className="bg-gray-200 px-2 py-0.5 w-full overflow-y-auto h-25 rounded-md">
          {children}
        </div>
      )}
    </p>
  );
};

TraceDataCell.defaultProps = {
  multilines: false,
};
