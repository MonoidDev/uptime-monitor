import React from 'react';

export interface ChartContainerProps {
  title: React.ReactNode;
  titleRight?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = (props) => {
  const {
    title,
    titleRight,
    children,
  } = props;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="text-black text-2xl leading-relaxed mb-4">
          {title}
        </div>
        {titleRight}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
