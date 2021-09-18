import React from 'react';

export interface ChartContainerProps {
  title: React.ReactNode;
  height?: number;
  width?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = (props) => {
  const {
    title,
    children,
    height,
    width,
  } = props;

  return (
    <div className="flex flex-col" style={{ height, width }}>
      <div className="text-black text-2xl leading-relaxed mb-4">
        {title}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
