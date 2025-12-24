'use client';

import React from 'react';
import { Layout, Menu, Dropdown, Space, Typography, Tag, Avatar } from 'antd';
import { 
  LogoutOutlined, 
  SettingOutlined, 
  UserOutlined,
  SearchOutlined,
  CloudOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks';
import { getEnvironmentName, isProduction } from '../../config/env';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const envName = getEnvironmentName();
  const isProd = isProduction();

  const handleLogout = async () => {
    await logout();
    router.push('/6ixgo-cs/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <SearchOutlined />,
      label: 'Product Search',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    if (info.key !== pathname) {
      router.push(info.key);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Header className="app-header">
      {/* Left: Logo and Nav */}
      <Space size="middle">
        <Text strong style={{ fontSize: 16, color: '#1890ff', whiteSpace: 'nowrap' }}>
          6ixgo CS
        </Text>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', minWidth: 0, background: 'transparent' }}
          className="desktop-only"
        />
      </Space>

      {/* Right: Environment & User */}
      <Space size="small">
        {/* Environment Badge (auto-detected) */}
        <Tag 
          icon={<CloudOutlined />} 
          color={isProd ? 'red' : 'blue'}
          style={{ margin: 0 }}
        >
          {envName}
        </Tag>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} size="small" />
            <Text className="header-user-name">Admin</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
