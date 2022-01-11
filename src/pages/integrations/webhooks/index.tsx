import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import { Typography, Table, Button } from 'antd';
import { url } from 'app/../.next-urls';
import { Layout } from 'app/components/Layout';
import { gStyles } from 'app/styles';
import classNames from 'classnames';
import { useWebhooksQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

export default function Page() {
  const { search, updateSearch } = useSearch(
    useMemo(
      () =>
        t.type({
          page: h.omittable(h.number().castString()),
          pageSize: h.omittable(h.number().castString()),
        }),
      [],
    ),
  );

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">Webhooks</Typography.Title>
      </div>
    );
  };

  const router = useRouter();

  const webhooks = useWebhooksQuery({
    variables: {
      page: search?.page ?? 1,
      pageSize: search?.pageSize ?? 10,
    },
    fetchPolicy: 'cache-and-network',
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'URL',
      dataIndex: 'url',
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
  ];

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Integrations',
          href: '/integrations/webhooks',
        },
        {
          title: 'Webhooks',
          href: '/integrations/webhooks',
        },
      ]}
      queries={[webhooks]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <div className="flex">
          <Button
            type="primary"
            shape="round"
            onClick={() => router.push(`${url('/integrations/webhooks/form')}`)}
          >
            Add
          </Button>
        </div>

        <Table
          bordered={false}
          className={classNames('py-8', gStyles.tableRowClickable)}
          dataSource={webhooks.data?.webhooks?.results.map((r) => ({ ...r, key: r.id }))}
          columns={columns}
          onRow={(record) => ({
            onClick() {
              router.push(`${url('/integrations/webhooks/form')}?editId=${record.id}`);
            },
          })}
          pagination={{
            showSizeChanger: true,
            className: 'flex justify-end pt-10',
            pageSize: search?.pageSize ?? 10,
            pageSizeOptions: ['10', '20', '50'],
            total: webhooks.data?.webhooks?.count,
            current: search?.page ?? 1,
            onChange: (page, pageSize) =>
              updateSearch({
                page,
                pageSize,
              }),
          }}
        />
      </div>
    </Layout>
  );
}
