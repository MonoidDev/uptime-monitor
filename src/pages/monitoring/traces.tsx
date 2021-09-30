import React, { useMemo, useState } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  Modal,
} from 'antd';
import { BidirectionalPagination } from 'app/components/CursorPagination';
import { DatePicker } from 'app/components/DatePicker';
import { traceColorMap } from 'app/components/traces';
import dayjs, { Dayjs } from 'dayjs';
import { useGetTraceByIdQuery, useTracesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import { unstable_batchedUpdates } from 'react-dom';
import * as h from 'tyrann-io';

import { Layout } from '../../components/Layout';
import { TraceDataCell } from '../../components/TraceDataCell';

interface Website {
  name: string,
  url: string,
}

interface TraceItem {
  key: string;
  id: number;
  type: string;
  website: Website;
  websiteId: number;
  status: string;
  duration: number;
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
    }), []),
  );

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [traceId, setTraceId] = useState<number>(0);

  const [afterId, setAfterId] = useState<number | undefined>(2 ** 31 - 1);
  const [beforeId, setBeforeId] = useState<number | undefined>(undefined);

  const tracesResponse = useTracesQuery({
    variables: {
      query: {
        afterId,
        beforeId,
        rangeTime: undefined,
        timeAfter: search?.timeAfter,
        timeBefore: search?.timeBefore,
      },
    },
  });

  const traceResponse = useGetTraceByIdQuery({
    variables: {
      id: traceId,
    },
  });

  const tracesData = tracesResponse.data?.traces;

  const traceData = traceResponse.data?.trace;

  const traceItems = tracesData?.results?.map((trace) => ({
    key: String(trace.id),
    id: trace.id,
    type: trace.traceType,
    website: {
      name: trace.website.name,
      url: trace.website.url,
    },
    websiteId: trace.websiteId,
    duration: trace.duration,
    status: trace.status,
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
      title: 'Action',
      key: 'action',
      render: (_: any, record: TraceItem) => (
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
    const currentMinId = Math.min(...tracesData?.results.map((trace) => trace.id) ?? []);
    const currentMaxId = Math.max(...tracesData?.results.map((trace) => trace.id) ?? []);

    return (
      <div className="flex justify-between">
        <BidirectionalPagination
          hasMoreBefore={(tracesData?.maxId ?? 0) > currentMaxId}
          hasMoreAfter={(tracesData?.minId ?? 0) < currentMinId}
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
