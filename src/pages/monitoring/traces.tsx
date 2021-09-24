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
import * as t from 'io-ts';
import * as h from 'tyrann-io';

import { Layout } from '../../components/Layout';

interface Website {
  id: number,
  name: string,
  url: string,
  pingInterval: number,
}

interface TraceItem {
  key: string;
  id: number;
  type: string;
  website: Website;
  time: string;
  status: string | null | undefined;
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
  const [traceData, setTraceData] = useState<TraceItem | {}>({});

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

  const showDetails = (id:number) => {
    setTraceData(exampleData[0]);
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
          <span className="pr-2 pt-2"> to </span>
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
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        {renderSearch()}
        <Table
          bordered={false}
          className="py-8"
          dataSource={exampleData}
          columns={columns}
          pagination={{
            className: 'flex justify-end pt-10',
          }}
        />
        <Modal
          title={`Trace #${'id' in traceData ? traceData.id : ''}`}
          visible={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
        >
          <p className="flex justify-between py-1.5">
            <div> Type </div>
            <div className="bg-gray-200 pl-2 py-0.5 w-3/4 rounded-md">
              {'type' in traceData ? traceData.type : ''}
            </div>
          </p>
          <p className="flex justify-between py-1.5">
            <div> Website </div>
            <div className="pl-2 py-0.5 w-3/4 rounded-md">
              {'website' in traceData
                ? (
                  <a
                    className="underline"
                    href={traceData.website.url}
                  >
                    {traceData.website.name}
                  </a>
                ) : ''}
            </div>
          </p>
          <p className="flex justify-between py-1.5">
            <div> Time </div>
            <div className="bg-gray-200 pl-2 py-0.5 w-3/4 rounded-md">
              {'time' in traceData ? traceData.time : ''}
            </div>
          </p>
          <p className="flex justify-between py-1.5">
            <div> Status </div>
            <div className="bg-gray-200 pl-2 py-0.5 w-3/4 rounded-md">
              {'status' in traceData ? traceData.status : ''}
            </div>
          </p>
          <p className="flex justify-between py-1.5">
            <div> Duration </div>
            <div className="bg-gray-200 pl-2 py-0.5 w-3/4 rounded-md">
              {'duration' in traceData ? traceData.duration : ''}
            </div>
          </p>
        </Modal>
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

const exampleData = [
  {
    key: '1',
    id: 1,
    type: 'PING',
    website: {
      id: 1,
      url: 'https://www.google.com',
      name: 'Google Home',
      pingInterval: 100,
    },
    time: '2021-09-11 11:30:01',
    status: 'TIMEOUT',
    duration: 999,
  },
];
