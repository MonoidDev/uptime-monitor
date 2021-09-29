import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
} from 'antd';
import { gStyles } from 'app/styles';
import classNames from 'classnames';
import { useGetWebsitesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

import { url } from '../../../../.next-urls';
import { Layout } from '../../../components/Layout';

export default function Page() {
  const { search, updateSearch, setSearch } = useSearch(
    useMemo(() => t.type({
      keyword: h.omittable(t.string),
      page: h.omittable(h.number().castString()),
    }), []),
  );

  const router = useRouter();

  const websites = useGetWebsitesQuery({
    variables: {
      page: (search?.page ?? 0) + 1,
      keyword: search?.keyword,
    },
    fetchPolicy: 'cache-and-network',
  });

  const websitesData = websites.data?.websites;

  const websiteItems = websitesData?.results?.map((website) => ({
    id: website!.id,
    name: website!.name,
    url: website!.url,
    pingInterval: website!.pingInterval,
    enabled: website!.enabled,
    userId: website!.userId,
    status: [null, null, null, 'OK', 'OK', 'OK', 'OK', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT', 'TIMEOUT'],
  }));

  // const pageCount = 10;

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
        page: 0,
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
            <Input
              placeholder="Keyword"
              allowClear
              onChange={(e) => {
                if (e.type === 'click') {
                  setSearch({
                    keyword: undefined,
                    page: undefined,
                  });
                }
              }}
            />
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
            router.push(`${'/monitoring/websites/'}${record.id}`);
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
      queries={[
        websites,
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
              router.push(`${url('/monitoring/websites/add')}`);
            }}
          >
            Add
          </Button>
        </div>
        <Table
          bordered={false}
          className={classNames('py-8', gStyles.tableRowClickable)}
          dataSource={websiteItems}
          columns={columns}
          onRow={(record) => ({
            onClick() {
              router.push({
                pathname: `${url('/monitoring/websiteStatus/[id]')}`,
                query: `id=${record.id}`,
              });
            },
          })}
          pagination={{
            className: 'flex justify-end pt-10',
            pageSize: 10,
            total: websitesData?.count!,
            current: (search?.page ?? 0) + 1,
            onChange: (page) => updateSearch({ page: page - 1 }),
          }}
        />
      </div>
    </Layout>
  );
}

interface WebsiteItem {
  id: number;
  name: string;
  url: string;
  pingInterval: number;
  enabled: boolean;
  userId: number;
}
