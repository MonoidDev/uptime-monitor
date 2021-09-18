import React from 'react';

import HomeFilled from '@ant-design/icons/HomeFilled';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import {
  Avatar, Breadcrumb, Layout as AntdLayout, Menu,
} from 'antd';
import classNames from 'classnames';

import { Urls } from '../../.next-urls';
import { useMeQuery } from '../../graphql/client/generated';
import { useAuth } from '../hooks/useAuth';
import styles from './Layout.module.css';

const { Header, Sider, Content } = AntdLayout;

export interface BreadcrumbItem {
  title: string;
  href?: Urls;
}

export interface LayoutProps {
  showSider?: boolean;
  breadcrumb?: BreadcrumbItem[];
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const {
    showSider = true,
    breadcrumb,
    children,
  } = props;

  const auth = useAuth();

  const me = useMeQuery({
    skip: !auth.state.token,
  });

  const renderSider = () => {
    return (
      <Sider width={200}>
        <Menu
          mode="inline"
          className="bg-primary-dark text-white"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item
            key="sub1"
            icon={<HomeFilled />}
          >
            Dashboard
          </Menu.Item>
          <Menu.SubMenu
            key="sub2"
            icon={<MonitorOutlined />}
            title="Monitoring"
          >
            <Menu.Item>
              Websites
            </Menu.Item>
            <Menu.Item>
              Traces
            </Menu.Item>
            <Menu.Item>
              Events
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key="sub3"
            icon={<UserOutlined />}
            title="Users"
          >
            <Menu.Item>
              All Users
            </Menu.Item>
            <Menu.Item>
              Add User
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

  return (
    <AntdLayout className={classNames('h-screen', styles.layout)}>
      {renderHeader()}
      <AntdLayout hasSider={showSider}>
        {showSider && renderSider()}
        <AntdLayout>
          {breadcrumb && renderBreadcrumb()}
          <Content className="p-6 bg-gray-50">
            {children}
          </Content>
        </AntdLayout>
      </AntdLayout>
    </AntdLayout>
  );
};
