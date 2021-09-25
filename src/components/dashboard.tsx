import React from 'react';

import {
  Pagination, Button,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import random from 'lodash/random';
import range from 'lodash/range';

import { gStyles } from '../styles';
import tableStyles from '../styles/tableStyles.module.css';
import { SingleLineChart } from './SingleLineChart';

export const ResponseTimeChart: React.VFC = React.memo(() => {
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

export const ErrorChart: React.VFC = React.memo(() => {
  return (
    <SingleLineChart
      title="Errors"
      data={sampleErrorData}
      xDataKey="time"
      linkDataKey="count"
    />
  );
});

export const ErrorTable: React.VFC = React.memo(() => {
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

export const EventTable: React.VFC = React.memo(() => {
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

const sampleErrorData = range(31).map((i) => ({
  time: dayjs().subtract(31 - i, 'day').format('D/M'),
  count: random(0, 50, false),
}));

const sampleResponseTimeData = range(31).map((i) => ({
  time: dayjs().subtract(31 - i, 'day').format('D/M'),
  responseTime: random(100, 200, false),
}));
