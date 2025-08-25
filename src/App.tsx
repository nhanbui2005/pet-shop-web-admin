import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Discounts from './pages/Discounts';
import InventoryManagement from './pages/InventoryManagement';
import Suppliers from './pages/Suppliers';
import Categories from './pages/Categories';
import OrderManagement from './pages/OrderManagement';
import Login from './pages/Login';
import Notifacation from './pages/Notifacation';
import Vouchers from './pages/Vouchers';
import Support from './pages/Support';
import SupportDetail from './pages/SupportDetail';
import Blogs from './pages/Blogs';
import BlogCreate from './pages/BlogCreate';
import BlogEdit from './pages/BlogEdit';
import BlogDetail from './pages/BlogDetail';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import React from 'react';
import useSocket from './hooks/useSocket';
import ChatWidget from './components/ChatWidget';
import { getCurrentUser } from './api/axiosClient';
import { setUser } from './features/auth/authSlice';

const { defaultAlgorithm, darkAlgorithm } = theme;

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const location = useLocation();
  React.useEffect(() => {
    if (token) {
      getCurrentUser()
        .then(res => {
          if (res?.data) dispatch(setUser(res.data));
        })
        .catch(() => {});
    }
  }, [token, dispatch]);
  useSocket(token);
  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorPrimary: '#4338ca',
          colorError: '#e11d48',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        components: {
          Layout: {
            headerHeight: 64,
            headerPadding: '0 24px',
            headerColor: '#fff',
            headerBg: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
          },
          Menu: {
            itemSelectedBg: '#4338ca',
            itemSelectedColor: '#fff',
            itemHoverBg: '#4338ca20',
            itemHoverColor: '#4338ca',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
        },
      }}
    >
      {/* Ẩn ChatWidget khi ở trang /login */}
      {location.pathname !== '/login' && <ChatWidget />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/discounts" element={<Discounts />} />
                    <Route path="/orders" element={<OrderManagement />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/inventory" element={<InventoryManagement />} />
                    <Route path="/notifications" element={<Notifacation />} />
                    <Route path="/vouchers" element={<Vouchers />} />
                    {/* Thêm route cho Hỗ trợ khách hàng */}
                    <Route path="/support" element={<Support />} />
                    <Route path="/support/:conversationId" element={<SupportDetail />} />
                    {/* Thêm routes cho Blogs */}
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/create" element={<BlogCreate />} />
                    <Route path="/blogs/edit/:id" element={<BlogEdit />} />
                    <Route path="/blogs/:id" element={<BlogDetail />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
