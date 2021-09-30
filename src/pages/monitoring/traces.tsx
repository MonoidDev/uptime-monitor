import React, { useEffect, useMemo, useState } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
} from 'antd';
import { url } from 'app/../.next-urls';
import { CursorPagination } from 'app/components/CursorPagination';
import { DatePicker } from 'app/components/DatePicker';
import { traceColorMap, TraceDataModal } from 'app/components/traces';
import { useCursor } from 'app/hooks/useCursor';
import dayjs, { Dayjs } from 'dayjs';
import { useTracesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import Link from 'next/link';
import * as h from 'tyrann-io';

import { Layout } from '../../components/Layout';

interface Website {
  name: string,
  url: string,
  id: number;
}

interface FilterValues {
  timeAfter?: Dayjs;
  timeBefore?: Dayjs;
}

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      timeBefore: h.omittable(t.string),
      timeAfter: h.omittable(t.string),
      afterId: h.omittable(h.number().cast()),
      beforeId: h.omittable(h.number().cast()),
    }), []),
  );

  const [currentTrace, setCurrentTrace] = useState<number>();

  const tracesResponse = useTracesQuery({
    variables: {
      query: search!,
    },
    fetchPolicy: 'cache-and-network',
  });

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
    data: tracesResponse.data?.traces,
  });

  useEffect(() => {
    resetCursor();
  }, [search?.timeAfter, search?.timeBefore]);

  const tracesData = tracesResponse.data?.traces;

  const traceItems = tracesData?.results?.map((trace) => ({
    key: String(trace.id),
    ...trace,
  }));

  const columns = [
    {
      title: 'Type',
      dataIndex: 'traceType',
      key: 'traceType',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website: Website) => (
        <Link
          href={url('/monitoring/websiteStatus/[id]').replace('[id]', String(website.id))}
        >
          <a className="underline">
            {website.name}
          </a>
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <div className={traceColorMap[status]}>
          {status}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <span>
          {`${duration}ms`}
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: any) => (
        <span>
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Exclude<typeof traceItems, undefined>[number]) => (
        <Button
          type="primary"
          shape="round"
          onClick={() => setCurrentTrace(record.id)}
        >
          Details
        </Button>
      ),
    },
  ];

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Traces
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
      <div className="flex justify-between">
        <Button
          type="primary"
          shape="round"
          onClick={() => resetCursor()}
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
          title: 'Traces',
          href: '/monitoring/traces',
        },
      ]}
      queries={[tracesResponse]}
    >
      <TraceDataModal
        id={currentTrace}
        onClose={() => setCurrentTrace(undefined)}
        visible={currentTrace !== undefined}
      />
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        {renderSearch()}
        <Table
          bordered={false}
          className="py-8"
          dataSource={traceItems}
          columns={columns}
          pagination={{ position: [] }}
        />
        {renderBottom()}
      </div>
    </Layout>
  );
}
