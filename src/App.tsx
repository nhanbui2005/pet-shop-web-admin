import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useSelector } from 'react-redux';
import type { RootState } from './store';

const { defaultAlgorithm, darkAlgorithm } = theme;

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
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
      <Router>
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
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
