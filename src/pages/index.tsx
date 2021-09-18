import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography, Select, Row, Col,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as t from 'io-ts';
import { random } from 'lodash';
import range from 'lodash/range';
import {
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
} from 'recharts';
import * as h from 'tyrann-io';

import { ChartContainer } from '../components/ChartContainer';
import { Layout } from '../components/Layout';
import { gStyles } from '../styles';

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      range: h.omittable(t.string),
    }), []),
  );

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Dashboard
        </Typography.Title>

        <Select
          value={search?.range ?? '24h'}
          style={{ width: 120 }}
          onChange={(value) => updateSearch({ range: value })}
        >
          <Select.Option value="24h">24 Hours</Select.Option>
          <Select.Option value="7d">7 Days</Select.Option>
          <Select.Option value="31d">31 Days</Select.Option>
        </Select>
      </div>
    );
  };

  const renderErrorChart = () => {
    return (
      <div className={classNames(gStyles.paper, gStyles.chart)}>
        <Row>
          <Col span={12}>
            <ChartContainer
              title="Errors"
            >
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={sampleData}
                  margin={{ top: 25, bottom: 25 }}
                >
                  <CartesianGrid
                    horizontal
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={{
                      stroke: '#F2C94C',
                      strokeWidth: 2,
                    }}
                    tick={{ fill: '#C6BECF', fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#C6BECF', fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip />
                  <Line
                    type="linear"
                    dataKey="count"
                    stroke="rgb(68, 70, 116)"
                    strokeWidth="2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Col>

        </Row>
      </div>
    );
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Dashboard',
          href: '/',
        },
      ]}
    >
      {renderTitle()}
      {renderErrorChart()}
    </Layout>
  );
}

export const getServerSideProps = () => ({
  props: {},
});

export const sampleData = range(31).map((i) => ({
  time: dayjs().subtract(31 - i, 'day').format('d/m'),
  count: random(0, 50, false),
}));
