import React, { useEffect, useMemo, useState } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  Modal,
} from 'antd';
import { CursorPagination } from 'app/components/CursorPagination';
import { DatePicker } from 'app/components/DatePicker';
import { traceColorMap } from 'app/components/traces';
import { useCursor } from 'app/hooks/useCursor';
import dayjs, { Dayjs } from 'dayjs';
import { useGetTraceByIdQuery, useTracesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import * as h from 'tyrann-io';

import { Layout } from '../../components/Layout';
import { TraceDataCell } from '../../components/TraceDataCell';

interface Website {
  name: string,
  url: string,
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

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [traceId, setTraceId] = useState<number>(0);

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

  const traceResponse = useGetTraceByIdQuery({
    variables: {
      id: traceId,
    },
  });

  const tracesData = tracesResponse.data?.traces;

  const traceData = traceResponse.data?.trace;

  const traceItems = tracesData?.results?.map((trace) => ({
    key: String(trace.id),
    ...trace,
  }));

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website: Website) => (
        <a className="underline" href={website.url}>
          {website.name}
        </a>
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
          {`${duration}s`}
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
          onClick={() => showDetails(record.id)}
        >
          Details
        </Button>
      ),
    },
  ];

  const showDetails = (id: number) => {
    setTraceId(id);
    setModalVisible(true);
  };

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

  const renderTraceDataModal = () => {
    return (
      <Modal
        title={`Trace #${traceData?.id}`}
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <TraceDataCell label="Type">
          {traceData?.traceType}
        </TraceDataCell>
        <TraceDataCell label="Website">
          <a
            className="underline"
            href={traceData?.website.url}
          >
            {traceData?.website.name ?? ' '}
          </a>
        </TraceDataCell>
        <TraceDataCell label="Time">
          {traceData?.createdAt ? dayjs(traceData?.createdAt).format('YYYY-MM-DD HH:mm:ss') : ' '}
        </TraceDataCell>
        <TraceDataCell label="Status" className={traceColorMap[traceData?.status!]}>
          {traceData?.status ?? ' '}
        </TraceDataCell>
        <TraceDataCell label="Duration">
          {traceData?.duration ?? ' '}
        </TraceDataCell>
        <TraceDataCell label="Request Headers" multilines>
          {traceData?.requestHeaders ?? ' '}
        </TraceDataCell>
        <TraceDataCell label="Response Headers" multilines>
          {traceData?.responseHeaders ?? ' '}
        </TraceDataCell>
        <TraceDataCell label="Response Data" multilines>
          {traceData?.responseData ?? ' '}
        </TraceDataCell>
      </Modal>
    );
  };

  const renderBottom = () => {
    return (
      <div className="flex justify-between">
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
        {renderTraceDataModal()}
      </div>
    </Layout>
  );
}
