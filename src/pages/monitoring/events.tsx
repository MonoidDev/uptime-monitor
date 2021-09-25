import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  DatePicker,
  Tag,
} from 'antd';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

import { url } from '../../../.next-urls';
import { Layout } from '../../components/Layout';

interface Website {
  id: number,
  name: string,
  url: string,
  pingInterval: number,
}

interface EventItem {
  key: string;
  id: number;
  type: string;
  severity: string;
  website: Website;
  message: string;
  time: string;
  trace: number;
}

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      timeBefore: h.omittable(t.string),
      timeAfter: h.omittable(t.string),
    }), []),
  );

  const router = useRouter();

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
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (message: string, record: EventItem) => (
        <div>
          <Tag className={`${colorMap[record.severity]} rounded`}>
            {record.severity}
          </Tag>
          <span>
            {message}
          </span>
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (_:any, record: EventItem) => (
        <Button
          type="primary"
          shape="round"
        >
          Trace:
          {' '}
          {record.trace}
        </Button>
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
          title: 'Events',
          href: '/monitoring/events',
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
      </div>
    </Layout>
  );
}

const colorMap: { [key:string]: string } = {
  log: 'bg-black text-white',
  warning: 'bg-yellow-400 text-white',
  error: 'bg-red-600 text-white',
  fatal: 'bg=red=600 text-white',
};

const exampleData = [
  {
    key: '1',
    id: 1,
    type: 'Status Change',
    severity: 'error',
    website: {
      id: 1,
      url: 'https://www.google.com',
      name: 'Google Home',
      pingInterval: 100,
    },
    message: 'This site is down',
    time: '2021-09-11 11:30:01',
    trace: 1,
  },
];
