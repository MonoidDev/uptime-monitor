import React from 'react';

import {
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
  ResponsiveContainerProps,
  YAxisProps,
  XAxisProps,
} from 'recharts';

import { ChartContainer, ChartContainerProps } from './ChartContainer';

export interface SingleLineChartProps<T extends {}> {
  title: string;
  chartContainerProps?: Omit<ChartContainerProps, 'title'>;
  responsiveContainerProps?: ResponsiveContainerProps;
  data: T[];
  xDataKey: keyof T & string;
  linkDataKey: keyof T & string;
  xAxisProps?: XAxisProps;
  yAxisProps?: YAxisProps;
}

export const SingleLineChart = <T extends {}>(props: SingleLineChartProps<T>) => {
  const {
    title,
    chartContainerProps = {},
    responsiveContainerProps = {},
    data,
    xDataKey,
    linkDataKey,
    xAxisProps = {},
    yAxisProps = {},
  } = props;

  return (
    <ChartContainer
      title={title}
      {...chartContainerProps}
    >
      <ResponsiveContainer
        width="100%"
        height={300}
        {...responsiveContainerProps}
      >
        <RechartsLineChart
          data={data}
          margin={{ top: 25, bottom: 25 }}
        >
          <CartesianGrid
            horizontal
            vertical={false}
          />
          <XAxis
            tickLine={false}
            axisLine={{
              stroke: '#F2C94C',
              strokeWidth: 2,
            }}
            tick={{ fill: '#C6BECF', fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
            dataKey={xDataKey}
            {...xAxisProps}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#C6BECF', fontSize: 12 }}
            width={30}
            {...yAxisProps}
          />
          <Tooltip />
          <Line
            type="linear"
            dataKey={linkDataKey}
            stroke="rgb(68, 70, 116)"
            strokeWidth="2"
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>

  );
};
