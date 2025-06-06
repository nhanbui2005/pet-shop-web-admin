import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/products">Products</Link>,
    },
    {
      key: 'suppliers',
      icon: <ShopOutlined />,
      label: <Link to="/suppliers">Suppliers</Link>,
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/categories">Categories</Link>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];

  return (
    <Sider
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar; 