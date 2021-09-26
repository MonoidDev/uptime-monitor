import React from 'react';

import HomeFilled from '@ant-design/icons/HomeFilled';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';
import type { QueryResult } from '@apollo/client';
import {
  Avatar, Breadcrumb, Layout as AntdLayout, Menu,
  Spin,
} from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import { url, Urls } from '../../.next-urls';
import { useMeQuery } from '../../graphql/client/generated';
import { useAuth } from '../hooks/useAuth';
import { ErrorView } from './ErrorView';
import styles from './Layout.module.css';

const { Header, Sider, Content } = AntdLayout;

export interface BreadcrumbItem {
  title: string;
  href?: Urls;
}

export interface LayoutProps {
  showSider?: boolean;
  breadcrumb?: BreadcrumbItem[];
  queries?: QueryResult<any, any>[];
  children: React.ReactNode | (() => React.ReactNode);
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const {
    showSider = true,
    breadcrumb,
    children = null,
    queries = [],
  } = props;

  const auth = useAuth();

  const me = useMeQuery({
    skip: !auth.state.token,
  });

  const router = useRouter();

  // Get the deepest 'directory' that includes current route.
  const currentRoot = `/${router.pathname.split('/')[1] ?? ''}`;

  const isSuccessfull = queries.every((q) => q.data !== undefined);
  const isLoading = queries.some((q) => q.loading);
  const isFailed = queries.some((q) => q.error);

  const renderSider = () => {
    return (
      <Sider width={200}>
        <Menu
          mode="inline"
          className="bg-primary-dark text-white"
          defaultSelectedKeys={[router.pathname]}
          defaultOpenKeys={[currentRoot]}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item
            key="/"
            icon={<HomeFilled />}
            onClick={() => router.push(url('/'))}
          >
            Dashboard
          </Menu.Item>
          <Menu.SubMenu
            key="/monitoring"
            icon={<MonitorOutlined />}
            title="Monitoring"
          >
            <Menu.Item
              key={url('/monitoring/websites')}
              onClick={() => router.push(url('/monitoring/websites'))}
            >
              Websites
            </Menu.Item>
            <Menu.Item
              key={url('/monitoring/traces')}
              onClick={() => router.push(url('/monitoring/traces'))}
            >
              Traces
            </Menu.Item>
            <Menu.Item
              key={url('/monitoring/events')}
              onClick={() => { router.push(url('/monitoring/events')); }}
            >
              Events
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>
    );
  };

  const renderHeader = () => {
    return (
      <Header className="text-white text-2xl flex items-center">
        Uptime Monitor

        <div className="flex-1" />
        {me?.data && (
          <>
            <Avatar />

            <div className="px-6 text-sm">
              {me?.data?.me?.name}
            </div>
          </>
        )}
      </Header>
    );
  };

  const renderBreadcrumb = () => {
    return (
      <div
        className="bg-gray-100 h-12 border-b border-solid border-gray-300 p-6 flex items-center"
      >
        <HomeOutlined className="pr-3 color-gray-500" />
        <Breadcrumb>
          {breadcrumb?.map((b, i) => (
            <Breadcrumb.Item key={i} href={b.href}>
              {b.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
    );
  };

  const renderChildren = () => {
    if (typeof children === 'function') return children();
    return children;
  };

  return (
    <AntdLayout className={classNames('h-screen', styles.layout)}>
      {renderHeader()}
      <AntdLayout hasSider={showSider}>
        {showSider && renderSider()}
        <AntdLayout>
          {breadcrumb && renderBreadcrumb()}
          <Content className="p-6 bg-gray-100 overflow-y-scroll">
            {isSuccessfull && renderChildren()}
            {isFailed && (
              <div className="h-full flex justify-center items-center">
                <ErrorView
                  message={queries.map(
                    (m) => m.error!.message,
                  ).join('\n')}
                />
              </div>
            )}
            {isLoading && (
              <div className="h-full flex justify-center items-center">
                <Spin />
              </div>
            )}
          </Content>
        </AntdLayout>
      </AntdLayout>
    </AntdLayout>
  );
};
