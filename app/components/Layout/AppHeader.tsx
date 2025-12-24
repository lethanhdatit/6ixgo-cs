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
    router.push('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <SearchOutlined />,
      label: 'Product Search',
    },
  ];

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
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left: Logo and Nav */}
      <Space size="large">
        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
          6ixgo CS
        </Text>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ border: 'none' }}
        />
      </Space>

      {/* Right: Environment & User */}
      <Space size="middle">
        {/* Environment Badge (auto-detected) */}
        <Tag 
          icon={<CloudOutlined />} 
          color={isProd ? 'red' : 'blue'}
        >
          {envName}
        </Tag>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text>Admin</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
