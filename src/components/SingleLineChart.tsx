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
  tickFormatter?: ((value: any, index: number) => string)
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
    tickFormatter,
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
            tick={{
              fill: '#C6BECF', fontSize: 12, dy: 15, dx: -8,
            }}
            padding={{ left: 10, right: 10 }}
            dataKey={xDataKey}
            {...xAxisProps}
            minTickGap={0}
            interval={0}
            angle={-30}
            tickFormatter={tickFormatter}
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
