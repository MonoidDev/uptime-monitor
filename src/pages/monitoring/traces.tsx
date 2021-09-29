import React, { useMemo, useState } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  DatePicker,
  Modal,
} from 'antd';
import { useGetTraceByIdQuery, useTracesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
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

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      timeBefore: h.omittable(t.string),
      timeAfter: h.omittable(t.string),
    }), []),
  );

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [traceId, setTraceId] = useState<number>(0);

  const tracesResponse = useTracesQuery({
    variables: {
      query: {
        rangeTime: undefined,
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
        <div className={colorMap[status]}>
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
    const onFinish = async (values: any) => {
      updateSearch({
        ...values,
      });
    };
    return (
      <>
        <Form
          layout="inline"
          name="websiteSearch"
          initialValues={search}
          onFinish={onFinish}
        >
          <Form.Item name="timeAfter">
            <DatePicker showTime placeholder="Start Time" />
          </Form.Item>
          <span className="pr-3 pt-2"> to </span>
          <Form.Item name="timeBefore">
            <DatePicker showTime placeholder="End Time" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              shape="round"
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
            {traceData?.website.name}
          </a>
        </TraceDataCell>
        <TraceDataCell label="Time">
          {traceData?.createdAt}
        </TraceDataCell>
        <TraceDataCell label="Status">
          {traceData?.status}
        </TraceDataCell>
        <TraceDataCell label="Duration">
          {traceData?.duration}
        </TraceDataCell>
      </Modal>
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
          pagination={{
            className: 'flex justify-end pt-10',
          }}
        />
        {renderTraceDataModal()}
      </div>
    </Layout>
  );
}

const colorMap: { [key:string]: string } = {
  OK: 'text-green-400',
  TIMEOUT: 'text-yellow-400',
  HTTP_ERROR: 'text-red-600',
  SSL_ERROR: 'text-red-600',
};
