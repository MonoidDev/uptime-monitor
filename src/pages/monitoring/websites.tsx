import React from 'react';

// import useSearch from '@monoid-dev/use-search';
import { Typography, Table, Button } from 'antd';
import { useRouter } from 'next/router';

import { url } from '../../../.next-urls';
import { Layout } from '../../components/Layout';

export default function Page() {
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
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (statusArray: (string | null | undefined)[]) => (
        <div className="inline-flex space-x-1">
          {statusArray.map((status) => {
            if (!status) {
              return (
                <div className="flex-1 w-1 h-4 bg-gray-500" />
              );
            }
            if (status === 'OK') {
              return (
                <div className="flex-1 w-1 h-4 bg-green-400" />
              );
            }
            return (
              <div className="flex-1 w-1 h-4 bg-red-600" />
            );
          })}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Item) => (
        <Button
          type="primary"
          shape="round"
          onClick={() => {
            router.push(`${url('/monitoring/websiteDetails')}?id=${record.id}&action=modify`);
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
      <Table dataSource={exampleData} columns={columns} />
    </Layout>
  );
}

interface Item {
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
