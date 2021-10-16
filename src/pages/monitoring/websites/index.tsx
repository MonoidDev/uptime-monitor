import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  message,
  Typography,
  Table,
  Button,
  Form,
  Input,
} from 'antd';
import { DeleteButton } from 'app/components/DeleteButton';
import { StatusArray } from 'app/components/StatusArray';
import { gStyles } from 'app/styles';
import classNames from 'classnames';
import { useDeleteWebsiteMutation, useGetWebsitesQuery } from 'graphql/client/generated';
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
      pageSize: h.omittable(h.number().castString()),
      sortByName: h.omittable(h.string()),
    }), []),
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

  const [deleteWebsite] = useDeleteWebsiteMutation();

  const websitesData = websites.data?.websites;

  const websiteItems = websitesData?.results?.map((website) => ({
    ...website,
  }));

  const needGotoPrevPage = () => {
    const page = search?.page ?? 0;
    const pageSize = search?.pageSize ?? 10;
    const itemNum = (websitesData?.count ?? 0) % pageSize;
    return itemNum === 1 && page !== 0;
  };

  const getOnDelete = (record:WebsiteItem) => {
    return async () => {
      await deleteWebsite({
        variables: {
          websiteId: record.id,
        },
      }).then(async () => {
        message.success(`Successfully deleted site ${record.name}`);
        if (needGotoPrevPage()) {
          updateSearch({ page: search?.page! - 1 });
        } else {
          router.reload();
        }
      });
    };
  };

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
                    pageSize: undefined,
                    sortByName: undefined,
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: any[]) => (
        <div className="flex justify-start space-x-1">
          <StatusArray status={status} />
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
              router.push({
                pathname: `${url('/monitoring/websites/[id]')}`,
                query: `id=${record.id}`,
              });
            }}
          >
            Modify
          </Button>
          <DeleteButton
            onDelete={getOnDelete(record)}
          />
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
          onRow={(record) => ({
            onClick() {
              router.push({
                pathname: `${url('/monitoring/websiteStatus/[id]')}`,
                query: `id=${record.id}`,
              });
            },
          })}
          pagination={{
            showSizeChanger: true,
            className: 'flex justify-end pt-10',
            pageSize: (search?.pageSize ?? 10),
            pageSizeOptions: ['10', '20', '50'],
            total: websitesData?.count!,
            current: (search?.page ?? 0) + 1,
            onChange: (page, pageSize) => updateSearch({
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

interface WebsiteItem {
  id: number;
  name: string;
  url: string;
  pingInterval: number;
  enabled: boolean;
  userId: number;
}
