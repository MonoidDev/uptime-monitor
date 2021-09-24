import { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Button,
  Form,
  Input,
} from 'antd';
import * as t from 'io-ts';
import * as h from 'tyrann-io';

import { Layout } from '../../components/Layout';

export default function Page() {
  const { search } = useSearch(
    useMemo(() => t.type({
      id: h.omittable(h.number().cast()),
    }), []),
  );

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          {search?.id ? 'Modify Website' : 'Add Website'}
        </Typography.Title>
      </div>
    );
  };

  const websiteExampleData = search?.id ? {
    id: 1,
    name: 'Google',
    url: 'https://www.google.com',
    pingInterval: 100,
    emails: ['john.doe@gmail.com', 'jane.doe@gmail.com'],
  } : {};

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
        {
          title: search?.id ? String(search?.id) : 'Add',
        },
      ]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <Form
          layout="vertical"
          name="websiteSearch"
          initialValues={websiteExampleData}
          // onFinish={onFinish}
        >
          <Form.Item name="name" className="w-1/3">
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="url">
            <Input placeholder="URL" className="w-1/3" />
          </Form.Item>
          <Form.Item name="interval">
            <Input placeholder="Interval" className="w-1/3" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
            >
              {search?.id ? 'Modify' : 'Add'}
            </Button>
            {search?.id && (
            <Button
              type="primary"
              shape="round"
              htmlType="button"
              className="ml-5 bg-red-600 border-red-600 hover:bg-red-500 hover:border-red-500"
            >
              Delete
            </Button>
            )}
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
}
