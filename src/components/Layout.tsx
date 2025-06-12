import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Input,
  Avatar,
  Badge,
  Dropdown,
  Space,
  theme,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  LockOutlined,
  AppstoreOutlined,
  ShopOutlined,
  InboxOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import Suppliers from '../pages/Suppliers';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { 
    key: '/', 
    icon: <DashboardOutlined />, 
    label: <Link to="/">Dashboard</Link> 
  },
  { 
    key: '/products', 
    icon: <ShoppingCartOutlined />, 
    label: <Link to="/products">Products</Link> 
  },
  { 
    key: '/categories', 
    icon: <AppstoreOutlined />, 
    label: <Link to="/categories">Categories</Link> 
  },
  { 
    key: '/suppliers', 
    icon: <ShopOutlined />, 
    label: <Link to="/suppliers">Suppliers</Link> 
  },
  { 
    key: '/inventory', 
    icon: <InboxOutlined />, 
    label: <Link to="/inventory">Inventory</Link> 
  },
  { 
    key: '/customers', 
    icon: <UserOutlined />, 
    label: <Link to="/customers">Customers</Link> 
  },
  { 
    key: '/orders', 
    icon: <FileTextOutlined />, 
    label: <Link to="/orders">Orders</Link> 
  },
  { 
    key: '/discounts', 
    icon: <BellOutlined />, 
    label: <Link to="/discounts">Discounts</Link> 
  },
];

const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserSwitchOutlined />,
    label: 'Thông tin cá nhân',
  },
  {
    key: 'password',
    icon: <LockOutlined />,
    label: 'Đổi mật khẩu',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
    danger: true,
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { token } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <img src="/logo192.png" alt="logo" style={{ width: 32, height: 32 }} />
            {!collapsed && (
              <span style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: token.colorPrimary,
                letterSpacing: 1,
              }}>
                Pet Service
              </span>
            )}
          </Link>
          {!collapsed && (
            <div style={{ 
              fontSize: 12, 
              color: token.colorTextSecondary,
              marginTop: 4,
            }}>
              Admin Dashboard
            </div>
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />

        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          textAlign: 'center',
          padding: '16px',
          color: token.colorTextSecondary,
          fontSize: 12,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}>
          v1.0.0 &copy; 2024 Pet Service
        </div>
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <Space size="large">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />

            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            <Button type="text" icon={<SettingOutlined />} />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: token.colorPrimary }}>A</Avatar>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          minHeight: 280,
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 