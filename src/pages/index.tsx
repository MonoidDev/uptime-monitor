import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography, Select, Row, Col,
} from 'antd';
import {
  ErrorChart, ErrorTable, EventTable, ResponseTimeChart,
} from 'app/components/dashboard';
import { Layout } from 'app/components/Layout';
import { gStyles } from 'app/styles';
import { url } from 'app/utils/types';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as t from 'io-ts';
import random from 'lodash/random';
import range from 'lodash/range';
import * as h from 'tyrann-io';

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

  const renderErrors = () => {
    return (
      <div className={classNames(gStyles.paper, 'mb-8')}>
        <Row gutter={32}>
          <Col span={12}>
            <ErrorChart />
          </Col>

          <Col span={12}>
            <ErrorTable />
          </Col>
        </Row>
      </div>
    );
  };

  const renderResponseTimeAndEvents = () => {
    return (
      <Row gutter={32}>
        <Col span={12}>
          <div className={classNames(gStyles.paper)}>
            <ResponseTimeChart />
          </div>
        </Col>

        <Col span={12}>
          <div className={classNames(gStyles.paper, 'h-full')}>
            <EventTable />
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Dashboard',
          href: url('/'),
        },
      ]}
    >
      {renderTitle()}
      {renderErrors()}
      {renderResponseTimeAndEvents()}
    </Layout>
  );
}

export const getServerSideProps = () => ({
  props: {},
});

export const sampleErrorData = range(31).map((i) => ({
  time: dayjs().subtract(31 - i, 'day').format('D/M'),
  count: random(0, 50, false),
}));

export const sampleResponseTimeData = range(31).map((i) => ({
  time: dayjs().subtract(31 - i, 'day').format('D/M'),
  responseTime: random(100, 200, false),
}));
