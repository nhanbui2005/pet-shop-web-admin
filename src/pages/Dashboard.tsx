import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Button, Progress, List, Avatar, DatePicker, Select } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Line, Bar, Pie } from '@ant-design/plots';
import type { PieConfig } from '@ant-design/plots';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  PieChart,
  Pie as RePie,
  Cell,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Custom colors for charts
const chartColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa8c16',
  green: '#52c41a',
};

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending';
  date: string;
}

interface DailyOrder {
  date: string;
  orders: number;
}

interface TopCustomer {
  id: string;
  name: string;
  totalSpent: number;
  orders: number;
  rank: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rank: number;
}

interface SalesDataPoint {
  date: string;
  value: number;
  target: number;
}

interface TooltipDatum {
  date: string;
  value: number;
}

interface CategoryData {
  type: string;
  value: number;
  color: string;
}

interface PieLabelProps {
  type: string;
  percent: number;
}

const Dashboard: React.FC = () => {
  // Mock data - Replace with actual API calls
  const recentOrders: RecentOrder[] = [
    {
      id: 'ORD001',
      customer: 'Nguyễn Văn A',
      amount: 1500000,
      status: 'completed',
      date: '2024-03-15',
    },
    {
      id: 'ORD002',
      customer: 'Trần Thị B',
      amount: 2300000,
      status: 'processing',
      date: '2024-03-15',
    },
    {
      id: 'ORD003',
      customer: 'Lê Văn C',
      amount: 950000,
      status: 'pending',
      date: '2024-03-14',
    },
  ];

  // Mock data for charts
  const salesData: SalesDataPoint[] = [
    { date: '2024-01', value: 35000000, target: 40000000 },
    { date: '2024-02', value: 42000000, target: 40000000 },
    { date: '2024-03', value: 38000000, target: 40000000 },
    { date: '2024-04', value: 45000000, target: 40000000 },
    { date: '2024-05', value: 52000000, target: 40000000 },
    { date: '2024-06', value: 48000000, target: 40000000 },
  ];

  // Transform data for Line chart
  const lineChartData = salesData.map(item => [
    { date: item.date, value: item.value, type: 'Doanh thu thực tế' },
    { date: item.date, value: item.target, type: 'Mục tiêu' }
  ]).flat();

  const categoryData: CategoryData[] = [
    { type: 'Thức ăn', value: 45, color: '#1890ff' },
    { type: 'Chăm sóc', value: 25, color: '#52c41a' },
    { type: 'Đồ chơi', value: 20, color: '#faad14' },
    { type: 'Phụ kiện', value: 10, color: '#f5222d' },
  ];

  const dailyOrdersData: DailyOrder[] = [
    { date: '2024-03-10', orders: 12 },
    { date: '2024-03-11', orders: 15 },
    { date: '2024-03-12', orders: 18 },
    { date: '2024-03-13', orders: 14 },
    { date: '2024-03-14', orders: 16 },
    { date: '2024-03-15', orders: 20 },
  ];

  const topCustomers: TopCustomer[] = [
    { id: '1', name: 'Nguyễn Văn A', totalSpent: 15000000, orders: 12, rank: 1 },
    { id: '2', name: 'Trần Thị B', totalSpent: 12000000, orders: 10, rank: 2 },
    { id: '3', name: 'Lê Văn C', totalSpent: 9000000, orders: 8, rank: 3 },
    { id: '4', name: 'Phạm Thị D', totalSpent: 8500000, orders: 7, rank: 4 },
    { id: '5', name: 'Hoàng Văn E', totalSpent: 8000000, orders: 6, rank: 5 },
    { id: '6', name: 'Đỗ Thị F', totalSpent: 7500000, orders: 6, rank: 6 },
    { id: '7', name: 'Vũ Văn G', totalSpent: 7000000, orders: 5, rank: 7 },
    { id: '8', name: 'Lý Thị H', totalSpent: 6500000, orders: 5, rank: 8 },
    { id: '9', name: 'Ngô Văn I', totalSpent: 6000000, orders: 4, rank: 9 },
    { id: '10', name: 'Đinh Thị K', totalSpent: 5500000, orders: 4, rank: 10 },
  ];

  const topProducts: TopProduct[] = [
    { id: '1', name: 'Thức ăn cho chó Royal Canin', sales: 150, revenue: 15000000, rank: 1 },
    { id: '2', name: 'Sữa tắm cho mèo', sales: 120, revenue: 12000000, rank: 2 },
    { id: '3', name: 'Đồ chơi cho thú cưng', sales: 100, revenue: 9000000, rank: 3 },
    { id: '4', name: 'Cát vệ sinh cho mèo', sales: 90, revenue: 8000000, rank: 4 },
    { id: '5', name: 'Vòng cổ cho chó', sales: 85, revenue: 7500000, rank: 5 },
    { id: '6', name: 'Bàn chải chải lông', sales: 80, revenue: 7000000, rank: 6 },
    { id: '7', name: 'Thức ăn cho mèo Me-O', sales: 75, revenue: 6500000, rank: 7 },
    { id: '8', name: 'Chuồng cho thú cưng', sales: 70, revenue: 6000000, rank: 8 },
    { id: '9', name: 'Dây dắt cho chó', sales: 65, revenue: 5500000, rank: 9 },
    { id: '10', name: 'Bát ăn cho thú cưng', sales: 60, revenue: 5000000, rank: 10 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownOutlined style={{ color: '#FFD700', fontSize: '24px' }} />;
      case 2:
        return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: '24px' }} />;
      case 3:
        return <TrophyOutlined style={{ color: '#CD7F32', fontSize: '24px' }} />;
      default:
        return <span style={{ 
          color: '#666', 
          fontSize: '16px',
          fontWeight: 'bold',
          width: '24px',
          textAlign: 'center'
        }}>{rank}</span>;
    }
  };

  const columns: TableProps<RecentOrder>['columns'] = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Hoàn thành' },
          processing: { color: 'processing', text: 'Đang xử lý' },
          pending: { color: 'warning', text: 'Chờ xử lý' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const data = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'My Dataset',
        data: [30, 40, 30],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
        borderWidth: 1,
      },
    ],
  };
  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(0)}M VNĐ`;
  };

  const formatTooltipValue = (value: number) => [`${value.toLocaleString('vi-VN')} VNĐ`, ''];
  const formatTooltipLabel = (label: string) => `Tháng ${label}`;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ background: '#f0f5ff', border: 'none', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ fontSize: 18, fontWeight: 700, color: '#3f8600' }}>Tổng doanh thu</span>}
              value={15000000}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center' }}
              prefix={<DollarOutlined style={{ fontSize: 32, color: '#3f8600', marginRight: 8 }} />}
              suffix={<span style={{ fontSize: 18, fontWeight: 600, color: '#3f8600' }}>VNĐ</span>}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#3f8600', fontWeight: 600, fontSize: 16 }}>
                <RiseOutlined style={{ fontSize: 18 }} /> 12%
              </span>
              <span style={{ marginLeft: 8, color: '#999', fontSize: 14 }}>So với tháng trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ background: '#e6f7ff', border: 'none', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ fontSize: 18, fontWeight: 700, color: '#1890ff' }}>Đơn hàng mới</span>}
              value={25}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center' }}
              prefix={<ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff', marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#1890ff', fontWeight: 600, fontSize: 16 }}>
                <RiseOutlined style={{ fontSize: 18 }} /> 8%
              </span>
              <span style={{ marginLeft: 8, color: '#999', fontSize: 14 }}>So với tuần trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ background: '#f9f0ff', border: 'none', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ fontSize: 18, fontWeight: 700, color: '#722ed1' }}>Khách hàng mới</span>}
              value={15}
              valueStyle={{ color: '#722ed1', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center' }}
              prefix={<UserOutlined style={{ fontSize: 32, color: '#722ed1', marginRight: 8 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#722ed1', fontWeight: 600, fontSize: 16 }}>
                <RiseOutlined style={{ fontSize: 18 }} /> 5%
              </span>
              <span style={{ marginLeft: 8, color: '#999', fontSize: 14 }}>So với tuần trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ background: '#f0f5ff', border: 'none', borderRadius: 12 }}>
            <Statistic
              title={<span style={{ fontSize: 18, fontWeight: 700, color: '#1890ff' }}>Tỷ lệ hoàn thành</span>}
              value={85}
              suffix={<span style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>%</span>}
              valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center' }}
            />
            <Progress percent={85} showInfo={false} strokeColor="#1890ff" style={{ marginTop: 8 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Đơn hàng gần đây" hoverable>
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thống kê nhanh" hoverable>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8 }}>Đơn hàng hoàn thành</div>
                <Progress percent={70} status="active" strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>Đơn hàng đang xử lý</div>
                <Progress percent={20} status="active" strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>Đơn hàng chờ xử lý</div>
                <Progress percent={10} status="active" strokeColor="#faad14" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <LineChartOutlined style={{ color: chartColors.primary }} />
                <span>Doanh thu theo tháng</span>
              </Space>
            }
            hoverable
            style={{ height: '450px' }}
          >
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#666' }}
                    axisLine={{ stroke: '#666' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666' }}
                    axisLine={{ stroke: '#666' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={formatTooltipLabel}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1890ff"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name="Doanh thu thực tế"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#52c41a"
                    fillOpacity={1}
                    fill="url(#colorTarget)"
                    name="Mục tiêu"
                  />
                  <ReferenceLine y={40000000} stroke="#52c41a" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <PieChartOutlined style={{ color: chartColors.purple }} />
                <span>Phân bố danh mục</span>
              </Space>
            }
            hoverable
            style={{ height: '450px' }}
          >
            <div style={{ width: '100%', height: 350 }}>
              <Pie
                data={[
                  { type: 'Thức ăn', value: 45 },
                  { type: 'Chăm sóc', value: 25 },
                  { type: 'Đồ chơi', value: 20 },
                  { type: 'Phụ kiện', value: 10 },
                ]}
                angleField="value"
                colorField="type"
                radius={0.8}
                innerRadius={0.6}
                label={{
                  type: 'spider',
                  content: '{name} {percentage}',
                  style: { fontSize: 14, fontWeight: 600 },
                }}
                legend={{
                  position: 'bottom',
                }}
                interactions={[
                  { type: 'element-active' },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <UserOutlined style={{ color: chartColors.primary }} />
                <span>Top 10 Khách Hàng</span>
              </Space>
            }
            hoverable
            bodyStyle={{ maxHeight: '400px', overflow: 'auto' }}
          >
            <List
              dataSource={topCustomers}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Space>
                        {getRankIcon(item.rank)}
                        <Avatar style={{ backgroundColor: chartColors.primary }}>
                          {item.name.charAt(0)}
                        </Avatar>
                      </Space>
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        <span>
                          <DollarOutlined /> {item.totalSpent.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <span>
                          <ShoppingCartOutlined /> {item.orders} đơn hàng
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: chartColors.error }} />
                <span>Top 10 Sản Phẩm Bán Chạy</span>
              </Space>
            }
            hoverable
            bodyStyle={{ maxHeight: '400px', overflow: 'auto' }}
          >
            <List
              dataSource={topProducts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Space>
                        {getRankIcon(item.rank)}
                        <Avatar style={{ backgroundColor: chartColors.error }}>
                          {item.name.charAt(0)}
                        </Avatar>
                      </Space>
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        <span>
                          <ShoppingCartOutlined /> {item.sales} sản phẩm đã bán
                        </span>
                        <span>
                          <DollarOutlined /> {item.revenue.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: chartColors.success }} />
                <span>Đơn hàng theo ngày</span>
              </Space>
            }
            hoverable
            style={{ height: '300px' }}
          >
            <Bar
              data={dailyOrdersData}
              xField="date"
              yField="orders"
              color={(datum: DailyOrder) => {
                if (datum.orders >= 18) return chartColors.success;
                if (datum.orders >= 15) return chartColors.primary;
                return chartColors.warning;
              }}
              barSize={15}
              label={{
                position: 'top',
                style: {
                  fill: '#666',
                  fontSize: 10,
                },
              }}
              xAxis={{
                label: {
                  style: {
                    fill: '#666',
                    fontSize: 10,
                  },
                },
                grid: {
                  line: {
                    style: {
                      stroke: '#f0f0f0',
                      lineDash: [4, 4],
                    },
                  },
                },
              }}
              yAxis={{
                label: {
                  style: {
                    fill: '#666',
                    fontSize: 10,
                  },
                },
                grid: {
                  line: {
                    style: {
                      stroke: '#f0f0f0',
                      lineDash: [4, 4],
                    },
                  },
                },
              }}
              state={{
                active: {
                  style: {
                    fill: chartColors.success,
                    fillOpacity: 0.8,
                  },
                },
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 