import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography, Select, Row, Col, Pagination, Button,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as t from 'io-ts';
import { random } from 'lodash';
import range from 'lodash/range';
import * as h from 'tyrann-io';

import { Layout } from '../components/Layout';
import { SingleLineChart } from '../components/SingleLineChart';
import { gStyles } from '../styles';
import tableStyles from '../styles/tableStyles.module.css';

const ResponseTimeChart: React.VFC = React.memo(() => {
  return (
    <SingleLineChart
      title="Response Time"
      data={sampleResponseTimeData}
      xDataKey="time"
      linkDataKey="responseTime"
      yAxisProps={{
        unit: 'ms',
        width: 60,
      }}
    />
  );
});

const ErrorChart: React.VFC = React.memo(() => {
  return (
    <SingleLineChart
      title="Errors"
      data={sampleErrorData}
      xDataKey="time"
      linkDataKey="count"
    />
  );
});

const ErrorTable: React.VFC = React.memo(() => {
  const renderTable = () => {
    return (
      <table className={tableStyles.simpleTable}>
        <thead>
          <tr>
            <th>
              Website
            </th>
            <th>
              Status
            </th>
            <th>
              Count
            </th>
            <th>
              {' '}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a>
                Google Home
              </a>
            </td>
            <td className={tableStyles.error}>
              Timeout
            </td>
            <td>
              100
            </td>
            <td>
              <a>
                More
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderBottom = () => {
    return (
      <div className="flex justify-between">
        <Button
          type="primary"
          shape="round"
        >
          All
        </Button>

        <Pagination
          current={1}
          pageSize={10}
          total={50}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      {renderTable()}
      {renderBottom()}
    </div>
  );
});

const EventTable: React.VFC = React.memo(() => {
  const renderTable = () => {
    return (
      <table className={tableStyles.simpleTable}>
        <thead>
          <tr>
            <th>
              Event
            </th>
            <th>
              Time
            </th>
            <th>
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className={classNames(gStyles.tag, gStyles.error, 'mr-2')}>
                error
              </span>

              <a>
                Google Home
              </a>
              {' '}
              is down.
            </td>
            <td>
              2021-09-11 11:30:01
            </td>
            <td>
              <a>
                Trace
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderBottom = () => {
    return (
      <div className="flex justify-between">
        <Button
          type="primary"
          shape="round"
        >
          All
        </Button>

        <Pagination
          current={1}
          pageSize={10}
          total={50}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      {renderTable()}
      {renderBottom()}
    </div>
  );
});

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
          href: '/',
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
