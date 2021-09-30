import React, { useEffect, useMemo, useState } from 'react';

import {
  Pagination, Button,
} from 'antd';
import { url } from 'app/../.next-urls';
import {
  TracesQuery,
  useGetFirstWebsiteQuery,
  useTraceOfErrorCountQuery,
  useTraceOfResponseTimeQuery,
  useTracesQuery,
} from 'app/../graphql/client/generated';
import { getTickCountFromRangeTime, getTickFromRangeTime } from 'app/utils/date';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Link from 'next/link';
import { unstable_batchedUpdates } from 'react-dom';

import { gStyles } from '../styles';
import tableStyles from '../styles/tableStyles.module.css';
import { BidirectionalPagination } from './BidirectionalPagination';
import { QueryContainer } from './QueryContainer';
import { SingleLineChart } from './SingleLineChart';

export interface TimeDataPoint {
  time: string;
  y: number;
}

export const normalizeTraceGroups = <
  T extends { groupId: number },
>(
    rangeTime: string,
    groups: T[],
    getPlaceholder: ((id: number) => T),
  ) => {
  const tickCount = getTickCountFromRangeTime(rangeTime);

  let i = 0;
  let j = 0;

  const result: T[] = [];

  while (j < tickCount) {
    if (i >= groups.length || groups[i].groupId > j) {
      result.push({
        ...getPlaceholder(j),
        groupId: j,
      });
      j++;
    } else {
      result.push(groups[i]);
      i++;
      j++;
    }
  }

  return result;
};

export interface ResponseTimeChartProps {
  rangeTime: string;
}

export const ResponseTimeChart: React.VFC<ResponseTimeChartProps> = React.memo((props) => {
  const { rangeTime } = props;

  const traces = useTraceOfResponseTimeQuery({
    variables: {
      rangeTime,
    },
    fetchPolicy: 'cache-and-network',
  });

  const traceOfResponseTime = traces.data?.traceOfResponseTime;

  const data = useMemo(() => {
    if (!traceOfResponseTime) return [];

    const normalized = normalizeTraceGroups(
      rangeTime,
      traceOfResponseTime,
      (i: number) => ({
        groupId: i,
        time: getTickFromRangeTime(rangeTime, i),
        avgDuration: NaN,
      }),
    );

    return normalized.map((n) => ({
      time: rangeTime === '24h' ? dayjs(n.time).format('hh:mm') : dayjs(n.time).format('M-D'),
      iso: n.time,
      avgDuration: n.avgDuration,
    }));
  }, [traceOfResponseTime]);

  return (
    <QueryContainer
      queries={[traces]}
      isNotFound={traces.data?.traceOfResponseTime?.length === 0}
      renderNotFound={() => (
        <div className="flex justify-center items-center h-[355px] text-gray-500 text-lg">
          There are no ping records in past
          {rangeTime}
        </div>
      )}
      className="h-[355px]"
    >
      {() => (
        <SingleLineChart
          title="Response Time"
          data={data}
          xDataKey="time"
          linkDataKey="avgDuration"
          yAxisProps={{
            unit: 'ms',
            width: 60,
          }}
        />
      )}
    </QueryContainer>
  );
});

export interface ErrorChartProps {
  rangeTime: string;
  websiteId?: number;
}

export const ErrorChart: React.VFC<ErrorChartProps> = React.memo((props) => {
  const { rangeTime, websiteId } = props;

  const firstWebsite = useGetFirstWebsiteQuery();

  const traceCount = useTraceOfErrorCountQuery({
    variables: {
      rangeTime,
      websiteId,
    },
    fetchPolicy: 'cache-and-network',
  });

  const traceOfErrorCount = traceCount.data?.traceOfErrorCount;

  const data = useMemo(() => {
    if (traceCount.data === undefined) return [];

    const normalized = normalizeTraceGroups(
      rangeTime,
      traceCount.data!.traceOfErrorCount!,
      (i: number) => ({
        groupId: i,
        time: getTickFromRangeTime(rangeTime, i),
        count: 0,
      }),
    );

    return normalized.map((n) => ({
      time: rangeTime === '24h' ? dayjs(n.time).format('hh:mm') : dayjs(n.time).format('M-D'),
      iso: n.time,
      count: n.count,
    }));
  }, [traceOfErrorCount]);

  const tickCount = useMemo(() => {
    if (traceOfErrorCount === undefined) return 0;

    return Math.max(
      Math.max(...traceCount.data!.traceOfErrorCount!.map((d) => d.count)),
      2,
    );
  }, [traceOfErrorCount]);

  const upPercentage = useMemo(() => {
    if (!firstWebsite.data?.firstWebsite || !traceOfErrorCount) {
      return 0;
    }

    const validPoints = data.filter(
      (p) => p.iso >= firstWebsite.data!.firstWebsite!.createdAt,
    );

    return validPoints.filter((p) => p.count === 0).length / validPoints.length;
  }, [traceOfErrorCount, firstWebsite.data?.firstWebsite]);

  // eslint-disable-next-line no-nested-ternary
  const tagClass = (upPercentage < 0.8)
    ? gStyles.error
    : (upPercentage < 0.9)
      ? gStyles.warning
      : gStyles.info;

  return (
    <QueryContainer
      queries={[traceCount, firstWebsite]}
      isNotFound={firstWebsite.data?.firstWebsite === null}
      className="h-[355px]"
    >
      {() => (
        <SingleLineChart
          title="Errors"
          data={data}
          xDataKey="time"
          linkDataKey="count"
          yAxisProps={{
            allowDecimals: false,
            tickCount,
          }}
          chartContainerProps={{
            titleRight: (
              <span className={classNames(gStyles.tag, tagClass, 'self-center m-3')}>
                Up:
                {' '}
                {Math.floor(upPercentage * 100)}
                %
              </span>
            ),
          }}
        />
      )}
    </QueryContainer>
  );
});

export interface ErrorTableProps {
  rangeTime: string;
  websiteId?: number;
}

export const ErrorTable: React.VFC<ErrorTableProps> = React.memo((props) => {
  const {
    rangeTime,
    websiteId,
  } = props;

  const [afterId, setAfterId] = useState<number | undefined>(2 ** 31 - 1);
  const [beforeId, setBeforeId] = useState<number | undefined>(undefined);

  useEffect(() => {
    unstable_batchedUpdates(() => {
      setAfterId(2 ** 31 - 1);
      setBeforeId(undefined);
    });
  }, [websiteId, rangeTime]);

  const traces = useTracesQuery({
    variables: {
      query: {
        afterId,
        beforeId,
        websiteId,
        rangeTime,
        isError: true,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const renderRow = (row: TracesQuery['traces']['results'][number]) => {
    return (
      <tr key={row.id}>
        <td>
          <Link
            href={url('/monitoring/websiteStatus/[id]').replace('[id]', String(row.website.id))}
          >
            {row.website.name}
          </Link>
        </td>
        <td className={tableStyles.error}>
          {row.status}
        </td>
        <td>
          {row.duration}
        </td>
        <td>
          <a>
            More
          </a>
        </td>
      </tr>
    );
  };

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
              Duration
            </th>
            <th>
              {' '}
            </th>
          </tr>
        </thead>
        <tbody>
          {traces.data?.traces.results.map((row) => renderRow(row))}
        </tbody>
      </table>
    );
  };

  const renderBottom = () => {
    const currentMinId = Math.min(...traces.data?.traces.results.map((t) => t.id) ?? []);
    const currentMaxId = Math.max(...traces.data?.traces.results.map((t) => t.id) ?? []);

    return (
      <div className="flex justify-between">
        <Button
          type="primary"
          shape="round"
        >
          All
        </Button>

        <BidirectionalPagination
          hasMoreBefore={(traces.data?.traces?.maxId ?? 0) > currentMaxId}
          hasMoreAfter={(traces.data?.traces?.minId ?? 0) < currentMinId}
          onClickAfter={() => {
            unstable_batchedUpdates(() => {
              setBeforeId(undefined);
              setAfterId(currentMinId);
            });
          }}
          onClickBefore={() => {
            unstable_batchedUpdates(() => {
              setBeforeId(currentMaxId);
              setAfterId(undefined);
            });
          }}
        />
      </div>
    );
  };

  return (
    <QueryContainer
      className="h-full"
      queries={[traces]}
    >
      {() => (
        <div className="h-full flex flex-col justify-between">
          {renderTable()}
          {renderBottom()}
        </div>
      )}
    </QueryContainer>
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
