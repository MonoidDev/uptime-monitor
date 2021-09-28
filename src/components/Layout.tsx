import React from 'react';

import DownOutlined from '@ant-design/icons/DownOutlined';
import HomeFilled from '@ant-design/icons/HomeFilled';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';
import type { QueryResult } from '@apollo/client';
import {
  Avatar, Breadcrumb, Dropdown, Layout as AntdLayout, Menu,
} from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import { url, Urls } from '../../.next-urls';
import { useMeQuery } from '../../graphql/client/generated';
import { useAuth } from '../hooks/useAuth';
import { ErrorView } from './ErrorView';
import styles from './Layout.module.css';
import { QueryContainer } from './QueryContainer';

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

  const onLogout = () => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Do you really want to log out? ')) {
      auth.dispatch({
        type: 'logout',
      });
      router.replace(url('/auth/login'));
    }
  };

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

  const renderUserMenu = () => {
    const menu = (
      <Menu>
        <Menu.Item>
          <a onClick={onLogout}>
            Log out
          </a>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <div className="px-6 text-sm self-stretch flex flex-col justify-center hover:cursor-pointer">
          <div>
            {me?.data?.me?.name}
            <DownOutlined className="ml-4" style={{ fontSize: 12 }} />
          </div>
        </div>
      </Dropdown>
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
            {renderUserMenu()}
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

  return (
    <AntdLayout className={classNames('h-screen', styles.layout)}>
      {renderHeader()}
      <AntdLayout hasSider={showSider}>
        {showSider && renderSider()}
        <AntdLayout>
          {breadcrumb && renderBreadcrumb()}
          <Content className="p-6 bg-gray-100 overflow-y-scroll">
            <QueryContainer
              renderError={() => (
                <div className="h-full flex justify-center items-center">
                  <ErrorView
                    message={queries.map(
                      (m) => m.error!.message,
                    ).join('\n')}
                  />
                </div>
              )}
            >
              {children}
            </QueryContainer>
          </Content>
        </AntdLayout>
      </AntdLayout>
    </AntdLayout>
  );
};
