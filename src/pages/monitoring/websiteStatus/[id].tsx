import React, { useMemo } from 'react';

import useSearch from '@monoid-dev/use-search';
import {
  Select, Typography, Descriptions, Button, Row, Col,
} from 'antd';
import { url } from 'app/../.next-urls';
import { useGetWebsiteByIdQuery } from 'app/../graphql/client/generated';
import {
  ErrorChart, ErrorTable, EventTable, ResponseTimeChart,
} from 'app/components/dashboard';
import { Layout } from 'app/components/Layout';
import { StatusArray } from 'app/components/StatusArray';
import { usePageQuery } from 'app/hooks/usePageQuery';
import { gStyles } from 'app/styles';
import descriptionsStyles from 'app/styles/descriptionsStyles.module.css';
import classNames from 'classnames';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

export default function Page() {
  const router = useRouter();

  const { search, updateSearch } = useSearch(
    useMemo(() => t.type({
      rangeTime: h.omittable(t.string),
    }), []),
  );

  const {
    rangeTime = '24h',
  } = search ?? {};

  const { id } = usePageQuery(
    useMemo(() => t.type({
      id: h.number().castString(),
    }), []),
  );

  const website = useGetWebsiteByIdQuery({
    variables: {
      id,
    },
  });

  const renderTitle = () => {
    return (
      <div className="flex items-center mb-8">
        <Typography.Title className="!text-primary-dark !mb-0 mr-4">
          {website.data?.website?.name}
        </Typography.Title>

        <StatusArray
          status={[
            'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'ERROR', 'ERROR', 'ERROR', 'OK', 'OK', 'OK', 'ERROR', 'ERROR',
          ]}
        />

        <div className="flex-1" />

        <Button
          type="primary"
          shape="round"
          className="mr-4"
          onClick={() => router.push(url('/monitoring/websites'))}
        >
          All Sites
        </Button>

        <Select
          value={rangeTime!}
          style={{ width: 120 }}
          onChange={(value) => updateSearch({ rangeTime: value })}
        >
          <Select.Option value="24h">24 Hours</Select.Option>
          <Select.Option value="7d">7 Days</Select.Option>
          <Select.Option value="31d">31 Days</Select.Option>
        </Select>
      </div>
    );
  };

  const renderWebsiteInfo = () => {
    return (
      <div className={classNames(gStyles.paper, descriptionsStyles.descriptions, 'mb-8')}>
        <Descriptions title="Website">
          <Descriptions.Item label="Name">
            {website.data?.website?.name}
          </Descriptions.Item>
          <Descriptions.Item label="URL">
            <a
              href={website.data?.website?.url}
              target="_blank"
              rel="noreferrer"
            >
              {website.data?.website?.url}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Ping Interval (s)">
            {website.data?.website?.pingInterval}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  const renderErrors = () => {
    return (
      <div className={classNames(gStyles.paper, 'mb-8')}>
        <Row gutter={32}>
          <Col span={12}>
            <ErrorChart rangeTime={rangeTime!} websiteId={id} />
          </Col>

          <Col span={12}>
            <ErrorTable rangeTime={rangeTime!} websiteId={id} />
          </Col>
        </Row>
      </div>
    );
  };

  const renderResponseTimeAndEvents = () => {
    return (
      <Row gutter={32}>
        <Col span={12}>
          <div className={classNames(gStyles.paper)}>
            <ResponseTimeChart rangeTime={rangeTime!} />
          </div>
        </Col>

        <Col span={12}>
          <div className={classNames(gStyles.paper, 'h-full')}>
            <EventTable rangeTime={rangeTime!} />
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Monitoring',
        },
        {
          title: 'Websites',
          href: url('/monitoring/websites'),
        },
        {
          title: website?.data?.website?.name ?? 'Loading...',
        },
      ]}
      queries={[
        website,
      ]}
    >
      {() => (
        <>
          {renderTitle()}
          {renderWebsiteInfo()}
          {renderErrors()}
          {renderResponseTimeAndEvents()}
        </>
      )}
    </Layout>
  );
}

export const getServerSideProps = () => ({
  props: {},
});
