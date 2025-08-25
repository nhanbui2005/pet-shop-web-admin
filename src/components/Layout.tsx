import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Badge,
  Dropdown,
  Space,
  theme,
  Typography, // Import Typography
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
  LogoutOutlined,
  UserSwitchOutlined,
  LockOutlined,
  AppstoreOutlined,
  ShopOutlined,
  InboxOutlined,
  TagsOutlined,
  BuildOutlined, // New icon for Store Management
  BookOutlined, // Icon for Blogs
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography; // Destructure Title

interface LayoutProps {
  children: React.ReactNode;
}

// =================================================================
// STEP 1: Cấu trúc lại menuItems với `title` và `children`
// =================================================================
const menuItems = [
  { 
    key: '/', 
    icon: <DashboardOutlined />, 
    label: <Link to="/">Tổng quan</Link>,
    title: 'Tổng quan' // Thêm thuộc tính title
  },
  { 
    // Sub-menu for better organization
    key: 'store-management', 
    icon: <BuildOutlined />, 
    label: 'Quản lý Cửa hàng',
    title: 'Quản lý Cửa hàng',
    children: [
      { 
        key: '/products', 
        icon: <ShoppingCartOutlined />, 
        label: <Link to="/products">Sản phẩm</Link>,
        title: 'Quản lý Sản phẩm'
      },
      { 
        key: '/categories', 
        icon: <AppstoreOutlined />, 
        label: <Link to="/categories">Danh mục</Link>,
        title: 'Quản lý Danh mục'
      },
      { 
        key: '/suppliers', 
        icon: <ShopOutlined />, 
        label: <Link to="/suppliers">Nhà cung cấp</Link>,
        title: 'Quản lý Nhà cung cấp'
      },
      { 
        key: '/inventory', 
        icon: <InboxOutlined />, 
        label: <Link to="/inventory">Tồn kho</Link>,
        title: 'Quản lý Tồn kho'
      },
    ]
  },
  { 
    key: '/customers', 
    icon: <UserOutlined />, 
    label: <Link to="/customers">Khách hàng</Link>,
    title: 'Quản lý Khách hàng'
  },
  { 
    key: '/orders', 
    icon: <FileTextOutlined />, 
    label: <Link to="/orders">Đơn hàng</Link>,
    title: 'Quản lý Đơn hàng'
  },
  { 
    key: '/discounts', 
    icon: <TagsOutlined />, // Changed icon for clarity
    label: <Link to="/discounts">Giảm giá</Link>,
    title: 'Quản lý Giảm giá'
  },
  { 
    key: '/notifications', 
    icon: <BellOutlined />, 
    label: <Link to="/notifications">Thông báo</Link>,
    title: 'Quản lý Thông báo'
  },
  // Thêm tab Hỗ trợ khách hàng
  { 
    key: '/support', 
    icon: <UserSwitchOutlined />, 
    label: <Link to="/support">Hỗ trợ khách hàng</Link>,
    title: 'Hỗ trợ khách hàng'
  },
  // Thêm tab Blogs
  { 
    key: '/blogs', 
    icon: <BookOutlined />, 
    label: <Link to="/blogs">Bài viết</Link>,
    title: 'Quản lý Bài viết'
  },
];

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', icon: <UserSwitchOutlined />, label: 'Thông tin cá nhân' },
  { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
];

// Helper function to find menu item recursively
const findMenuItem = (items: any[], path: string): any => {
    for (const item of items) {
        if (path.startsWith(item.key)) {
            if (item.children) {
                const childMatch = findMenuItem(item.children, path);
                if (childMatch) return childMatch;
            }
            return item;
        }
    }
    return null;
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { token } = theme.useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =================================================================
  // STEP 2: Tìm title và các key cần thiết dựa trên location
  // =================================================================
  const { activeTitle, openKeys } = useMemo(() => {
    const path = location.pathname;
    let bestMatch = { title: 'Tổng quan', key: '/', parentKeys: [] as string[] };

    const findBestMatchRecursive = (items: any[], parentKeys: string[]) => {
        for (const item of items) {
            if (path.startsWith(item.key)) {
                // Nếu key của item hiện tại dài hơn key của bestMatch, nó khớp tốt hơn
                if (item.key.length > bestMatch.key.length) {
                    bestMatch = { ...item, parentKeys };
                }
            }
            if (item.children) {
                // Tiếp tục tìm trong các mục con
                findBestMatchRecursive(item.children, [...parentKeys, item.key]);
            }
        }
    };

    findBestMatchRecursive(menuItems, []);

    return {
        activeTitle: bestMatch.title,
        openKeys: bestMatch.parentKeys,
    };
}, [location.pathname])


  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240} // Tăng chiều rộng sider một chút
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
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* <img src="/logo192.png" alt="logo" style={{ width: 32, height: 32 }} /> */}
            {!collapsed && (
              <span style={{ fontSize: 18, fontWeight: 700, color: token.colorPrimary, letterSpacing: 1 }}>
                PET SERVICE
              </span>
            )}
          </Link>
        </div>

        <Menu
          theme="light"
          mode="inline"
          // Key để xác định mục nào đang được chọn
          selectedKeys={[location.pathname]}
          // Key để xác định submenu nào đang mở
          defaultOpenKeys={openKeys}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
        
        {/* Có thể bỏ phần footer này nếu không cần */}
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgElevated, // Thêm một chút màu nền cho header
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
            {/* LEFT SIDE: TOGGLE BUTTON AND PAGE TITLE */}
            <Space align="center">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '16px' }}
                />
                {/* ================================================================= */}
                {/* STEP 3: Hiển thị Title ở đây                                     */}
                {/* ================================================================= */}
                <Title level={4} style={{ margin: 0 }}>
                    {activeTitle}
                </Title>
            </Space>

            {/* RIGHT SIDE: ACTIONS */}
            <Space size="middle">
                {/* <Badge count={3} size="small">
                  <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
                </Badge> */}
                <Dropdown 
                  menu={{ 
                    items: userMenuItems, 
                    onClick: ({ key }) => {
                      if (key === 'logout') {
                        localStorage.removeItem('accessToken');
                        dispatch(logout());
                        navigate('/login');
                      }
                    }
                  }} 
                  placement="bottomRight" arrow>
                  <Space style={{ cursor: 'pointer' }}>
                    <Avatar style={{ backgroundColor: token.colorPrimary }}>A</Avatar>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 600 }}>Admin</span>
                        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Quản trị viên</span>
                    </div>
                  </Space>
                </Dropdown>
            </Space>
        </Header>

        <Content style={{ 
          margin: '24px',
          minHeight: 280,
        }}>
          {/* Nội dung của từng trang sẽ được render ở đây */}
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;