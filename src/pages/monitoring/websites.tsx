import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
} from 'antd';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

import { url } from '../../../.next-urls';
import { Layout } from '../../components/Layout';

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      keyword: h.omittable(t.string),
    }), []),
  );

  const router = useRouter();
  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Websites
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
          <Form.Item name="keyword">
            <Input placeholder="Keyword" />
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      render: (text: string) => <a href={text}>{text}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (statusArray: (string | null | undefined)[]) => (
        <div className="flex justify-start space-x-1">
          {statusArray.map((status) => {
            if (!status) {
              return (
                <div className="w-1.5 h-4 bg-gray-500" />
              );
            }
            if (status === 'OK') {
              return (
                <div className="w-1.5 h-4 bg-green-400" />
              );
            }
            return (
              <div className="w-1.5 h-4 bg-red-600" />
            );
          })}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: WebsiteItem) => (
        <Button
          type="primary"
          shape="round"
          onClick={() => {
            router.push(`${url('/monitoring/websiteDetails')}?id=${record.id}`);
          }}
        >
          Modify
        </Button>
      ),
    },
  ];

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Monitoring',
          href: '/monitoring/websites',
        },
        {
          title: 'Websites',
          href: '/monitoring/websites',
        },
      ]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <div className="flex justify-between items-center">
          {renderSearch()}
          <Button
            type="primary"
            shape="round"
            onClick={() => {
              router.push(`${url('/monitoring/websiteDetails')}`);
            }}
          >
            Add
          </Button>
        </div>
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

interface WebsiteItem {
  key: string;
  id: number;
  name: string;
  url: string;
  status: (string | null | undefined)[];
}

const exampleData = [
  {
    key: '1',
    id: 1,
    name: 'Google',
    url: 'https://www.google.com',
    status: [null, null, null, 'OK', 'OK', 'OK', 'OK', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT'],
  },
];
