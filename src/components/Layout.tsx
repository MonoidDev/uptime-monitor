import React from 'react';

import HomeFilled from '@ant-design/icons/HomeFilled';
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { Layout as AntdLayout, Menu } from 'antd';

const { Header, Sider, Content } = AntdLayout;

export interface LayoutProps {
  showSider?: boolean;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const {
    showSider = true,
    children,
  } = props;

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

  return (
    <AntdLayout className="h-screen">
      <Header className="text-white text-2xl flex items-center">
        Uptime Monitor
      </Header>
      <AntdLayout>
        {showSider && renderSider()}
        <Content className="p-6">
          {children}
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};
