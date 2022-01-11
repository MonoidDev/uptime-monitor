import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import { Typography, Table, Button, Form, Input } from 'antd';
import { SSLMessage } from 'app/components/SSLMessage';
import { gStyles } from 'app/styles';
import classNames from 'classnames';
import { useGetWebsitesQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

import { dynamicUrl, url } from '../../../.next-urls';
import { Layout } from '../../components/Layout';

export default function Page() {
  const { search, updateSearch, setSearch } = useSearch(
    useMemo(
      () =>
        t.type({
          keyword: h.omittable(t.string),
          page: h.omittable(h.number().castString()),
          pageSize: h.omittable(h.number().castString()),
          sortByName: h.omittable(h.string()),
        }),
      [],
    ),
  );

  const router = useRouter();

  const websites = useGetWebsitesQuery({
    variables: {
      page: (search?.page ?? 0) + 1,
      pageSize: search?.pageSize ?? 10,
      keyword: search?.keyword,
      sortByName: search?.sortByName,
    },
    fetchPolicy: 'cache-and-network',
  });

  type WebsiteItem = NonNullable<
    NonNullable<typeof websites['data']>['websites']
  >['results'][number];

  const websitesData = websites.data?.websites;

  const websiteItems = websitesData?.results?.map((website) => ({
    ...website,
  }));

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">SSL Status</Typography.Title>
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
        <Form layout="inline" name="websiteSearch" initialValues={search} onFinish={onFinish}>
          <Form.Item name="keyword">
            <Input
              placeholder="Keyword"
              allowClear
              onChange={(e) => {
                if (e.type === 'click') {
                  setSearch({
                    keyword: undefined,
                    page: undefined,
                    pageSize: undefined,
                    sortByName: undefined,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" shape="round" htmlType="submit">
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
      defaultSortOrder: search?.sortByName as any,
      sorter: true,
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      render: (text: string) => <a href={text}>{text}</a>,
    },
    {
      title: 'SSL Status',
      dataIndex: 'sslMessage',
      key: 'status',
      render: (sslMessage: WebsiteItem['sslMessage']) => (
        <div>
          <SSLMessage sslMessage={sslMessage} />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WebsiteItem) => (
        <div className="flex justify-start space-x-5">
          <Button
            type="primary"
            shape="round"
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                dynamicUrl('/monitoring/websiteStatus/[id]', {
                  id: record.id,
                }),
              );
            }}
          >
            Details
          </Button>
        </div>
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
          title: 'WebsiteStatus',
          href: '/monitoring/sslStatus',
        },
      ]}
      queries={[websites]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <div className="flex justify-between items-center">
          {renderSearch()}
          <Button
            type="primary"
            shape="round"
            onClick={() => router.push(`${url('/monitoring/websites/add')}`)}
          >
            Add
          </Button>
        </div>
        <Table
          bordered={false}
          className={classNames('py-8', gStyles.tableRowClickable)}
          dataSource={websiteItems}
          columns={columns}
          pagination={{
            showSizeChanger: true,
            className: 'flex justify-end pt-10',
            pageSize: search?.pageSize ?? 10,
            pageSizeOptions: ['10', '20', '50'],
            total: websitesData?.count!,
            current: (search?.page ?? 0) + 1,
            onChange: (page, pageSize) =>
              updateSearch({
                page: page - 1,
                pageSize,
              }),
          }}
          onChange={(_, __, sorter, extra) => {
            if (extra.action === 'sort') {
              if (!Array.isArray(sorter)) {
                updateSearch({
                  sortByName: sorter.order,
                  page: 0,
                });
              } else {
                throw new Error('Not handling multiple sorters');
              }
            }
          }}
        />
      </div>
    </Layout>
  );
}
