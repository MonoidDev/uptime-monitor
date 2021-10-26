import React, { useEffect, useMemo, useState } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
} from 'antd';
import { dynamicUrl } from 'app/../.next-urls';
import { useEventsQuery, useGetUserWebsitesQuery } from 'app/../graphql/client/generated';
import { CursorPagination } from 'app/components/CursorPagination';
import { DatePicker } from 'app/components/DatePicker';
import { Layout } from 'app/components/Layout';
import { TraceDataModal } from 'app/components/traces';
import { websiteEventTypeToDescription } from 'app/data/events';
import { traceStatusToColor } from 'app/data/traces';
import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import { useCursor } from 'app/hooks/useCursor';
import { gStyles } from 'app/styles';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import * as t from 'io-ts';
import omit from 'lodash/omit';
import Link from 'next/link';
import * as h from 'tyrann-io';

interface Website {
  name: string,
  id: number,
}

interface FilterValues {
  timeAfter?: Dayjs;
  timeBefore?: Dayjs;
}

export default function Page() {
  const [currentTrace, setCurrentTrace] = useState<number>();

  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      timeBefore: h.omittable(t.string),
      timeAfter: h.omittable(t.string),
      afterId: h.omittable(h.number().cast()),
      beforeId: h.omittable(h.number().cast()),
      websiteIds: h.omittable(t.array(h.number().cast())),
    }), []),
  );

  const finalSearch = {
    ...search,
    websiteIds: search?.websiteIds ?? [-1],
  };

  const userWebsitesResponse = useGetUserWebsitesQuery({
    fetchPolicy: 'cache-and-network',
  });

  const eventsResponse = useEventsQuery({
    variables: {
      query: {
        ...omit(finalSearch, ['websiteIds']),
        websiteId: finalSearch.websiteIds[0] === -1 ? undefined : finalSearch.websiteIds[0],
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const eventItems = eventsResponse?.data?.events.results.map((e) => ({
    ...e,
    key: String(e.id),
    message: (
      <>
        <span className={classNames(gStyles.tag, gStyles[e.status.toLowerCase()], 'mr-2')}>
          {e.status.toLowerCase()}
        </span>
        {websiteEventTypeToDescription[e.type as WebsiteEventSource](
          e.website.name,
          e.website.id,
        )}
        {' '}
        {e.trace?.status && (
          <>
            Reason:
            {' '}
            <span className={traceStatusToColor[e.trace.status]}>
              {e.trace.status}
            </span>
          </>
        )}
      </>
    ),
  }));

  const {
    hasMoreBefore,
    hasMoreAfter,
    nextPage,
    previousPage,
    resetCursor,
  } = useCursor({
    cursor: {
      afterId: search?.afterId,
      beforeId: search?.beforeId,
    },
    onCursorChange: (cursor) => updateSearch(cursor),
    data: eventsResponse.data?.events,
  });

  useEffect(() => {
    resetCursor();
  }, [
    finalSearch?.timeAfter,
    finalSearch?.timeBefore,
    finalSearch.websiteIds.toString(),
  ]);

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'websiteIds',
      render: (website: Website) => (
        <Link
          href={dynamicUrl('/monitoring/websiteStatus/[id]', {
            id: website.id,
          })}
        >
          <a className="underline">
            {website.name}
          </a>
        </Link>
      ),
      filters: [
        {
          text: 'All',
          value: -1,
        },
        ...userWebsitesResponse.data?.userWebsites.map((w) => ({
          text: w.name,
          value: w.id,
        })) ?? [],
      ],
      filteredValue: finalSearch.websiteIds,
      filterMultiple: false,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (message: React.ReactNode) => message,
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: any) => dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (_: any, record: Exclude<typeof eventItems, undefined>[number]) => (
        record.traceId
          ? (
            <Button
              type="primary"
              shape="round"
              onClick={() => setCurrentTrace(record.traceId!)}
            >
              Trace
              {' '}
              #
              {record.traceId}
            </Button>
          ) : '-'
      ),
    },
  ];

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Events
        </Typography.Title>
      </div>
    );
  };

  const renderSearch = () => {
    const onFinish = async (values: FilterValues) => {
      if (values.timeAfter && values.timeBefore && (values.timeAfter.toISOString() > values.timeBefore.toISOString())) {
        // eslint-disable-next-line no-alert
        window.alert('Cannot set the end time later than before time. ');
        return;
      }

      updateSearch({
        timeAfter: values.timeAfter?.toISOString(),
        timeBefore: values.timeBefore?.toISOString(),
      });
    };
    return (
      <>
        <Form
          layout="inline"
          name="websiteSearch"
          initialValues={{
            timeAfter: search?.timeAfter && dayjs(search?.timeAfter),
            timeBefore: search?.timeBefore && dayjs(search?.timeBefore),
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="timeAfter"
          >
            <DatePicker showTime placeholder="Start Time" />
          </Form.Item>
          <span className="pr-3 pt-2"> to </span>
          <Form.Item
            name="timeBefore"
          >
            <DatePicker showTime placeholder="End Time" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
            >
              Search
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  const renderBottom = () => {
    return (
      <div className="flex justify-start">
        <Button
          type="primary"
          shape="round"
          onClick={() => resetCursor()}
          className="mr-5"
        >
          Page 1
        </Button>
        <CursorPagination
          hasMoreBefore={hasMoreBefore}
          hasMoreAfter={hasMoreAfter}
          onClickAfter={nextPage}
          onClickBefore={previousPage}
        />
      </div>
    );
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Monitoring',
          href: '/monitoring/websites',
        },
        {
          title: 'Events',
          href: '/monitoring/events',
        },
      ]}
      queries={[eventsResponse]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        {renderSearch()}
        <TraceDataModal
          id={currentTrace}
          onClose={() => setCurrentTrace(undefined)}
          visible={currentTrace !== undefined}
        />
        <Table
          bordered={false}
          className="py-8"
          dataSource={eventItems}
          columns={columns}
          pagination={{ position: [] }}
          onChange={(_, filters) => {
            updateSearch(filters);
          }}
        />
        {renderBottom()}
      </div>
    </Layout>
  );
}
