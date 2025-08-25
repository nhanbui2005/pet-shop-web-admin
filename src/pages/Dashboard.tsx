import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Button, List, Avatar, DatePicker, Typography } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    DollarOutlined,
    RiseOutlined,
    LineChartOutlined,
    PieChartOutlined,
    TrophyOutlined,
    CrownOutlined,
    FireOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Area, Pie, Bar } from '@ant-design/plots';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../features/category/categorySlice';
import { fetchProducts } from '../features/product/productSlice';
import type { RootState } from '../store';
import axiosClient from '../api/axiosClient';

const { Title, Text, Link } = Typography;
const { RangePicker } = DatePicker;

// --- DỮ LIỆU MOCK ---
const recentOrders = [
    { id: 'ORD001', customer: 'Nguyễn Văn A', amount: 1500000, status: 'completed', date: '2025-06-27' },
    { id: 'ORD002', customer: 'Trần Thị B', amount: 2300000, status: 'processing', date: '2025-06-27' },
    { id: 'ORD003', customer: 'Lê Văn C', amount: 950000, status: 'cancelled', date: '2025-06-26' },
    { id: 'ORD004', customer: 'Phạm Thị D', amount: 3100000, status: 'completed', date: '2025-06-25' },
];
const salesData = [
    { date: 'Tháng 1', value: 3500, target: 4000 }, { date: 'Tháng 2', value: 4200, target: 4000 },
    { date: 'Tháng 3', value: 3800, target: 4000 }, { date: 'Tháng 4', value: 4500, target: 4000 },
    { date: 'Tháng 5', value: 5200, target: 4000 }, { date: 'Tháng 6', value: 4800, target: 4000 },
];
const topCustomers = [
    { id: '1', name: 'Nguyễn Văn Anh', totalSpent: 15000000, orders: 12, rank: 1 },
    { id: '2', name: 'Trần Thị Bảo', totalSpent: 12000000, orders: 10, rank: 2 },
    { id: '3', name: 'Lê Văn Cường', totalSpent: 9000000, orders: 8, rank: 3 },
    { id: '4', name: 'Phạm Thị Dung', totalSpent: 8500000, orders: 7, rank: 4 },
];
const topProducts = [
    { id: '1', name: 'Thức ăn chó Royal Canin', sales: 150, revenue: 15000000, rank: 1 },
    { id: '2', name: 'Sữa tắm cho mèo', sales: 120, revenue: 12000000, rank: 2 },
    { id: '3', name: 'Đồ chơi thú cưng', sales: 100, revenue: 9000000, rank: 3 },
    { id: '4', name: 'Cát vệ sinh cho mèo', sales: 90, revenue: 8000000, rank: 4 },
];

// --- CÁC COMPONENT CON ---

// 1. Component Thẻ Thống kê (StatCard)
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    trend: number;
    color: string;
    unit?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, color, unit }) => (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Space align="center" size="large">
            <Avatar size={48} icon={icon} style={{ backgroundColor: color, color: '#fff' }} />
            <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>{title}</Text>
                <Title level={3} style={{ marginTop: '4px', marginBottom: 0 }}>
                    {typeof value === 'number' ? value.toLocaleString('vi-VN') : value} {unit}
                </Title>
                <Text style={{ color: trend >= 0 ? '#52c41a' : '#f5222d', fontSize: '12px' }}>
                    <RiseOutlined /> {trend}% so với kỳ trước
                </Text>
            </div>
        </Space>
    </Card>
);

// 2. Component Biểu đồ Doanh thu
const RevenueChart: React.FC<{ data: any[] }> = ({ data }) => {
    const chartData = data.map(item => ({ date: item.date, value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0 }));
    const config = {
        data: chartData,
        xField: 'date',
        yField: 'value',
        yAxis: { label: { formatter: (v: number) => `${v.toLocaleString('vi-VN')} VNĐ` } },
        line: { style: { lineWidth: 2 } },
        point: { shape: 'circle', size: 3 },
        area: { style: { fillOpacity: 0 } },
        color: ['#1890ff'],
        smooth: true,
        tooltip: {
            showMarkers: false,
            showTitle: true,
            customContent: (title: string, items: any[]) => {
                console.log('Tooltip customContent - title:', title);
                console.log('Tooltip customContent - items:', items);
                if (items && items[0]) console.log('Tooltip customContent - items[0]:', items[0]);
                if (!items || items.length === 0) return '';
                let value: number | string = 0;
                if (typeof items[0].value === 'number') value = items[0].value;
                else if (items[0].data && typeof items[0].data.value === 'number') value = items[0].data.value;
                else if (items[0].data && typeof items[0].data === 'object') value = JSON.stringify(items[0].data);
                else value = JSON.stringify(items[0]);
                if (typeof value === 'string' && value.startsWith('{')) {
                    return `<div style=\"padding:8px 12px\"><b>${title}</b><br/>DEBUG: <pre>${value}</pre></div>`;
                }
                if (typeof value === 'number') {
                    return `<div style=\"padding:8px 12px\"><b>${title}</b><br/>Tổng doanh thu: <b>${value.toLocaleString('vi-VN')} VNĐ</b></div>`;
                }
                return `<div style=\"padding:8px 12px\"><b>${title}</b><br/>Tổng doanh thu: <b>${value} VNĐ</b></div>`;
            }
        },
        legend: false,
        style: { background: '#fff', height: '300px' },
    };
    return <Area {...config} />;
};

// 3. Component Biểu đồ tròn Phân loại
const CategoryPieChart: React.FC<{ data: any[] }> = ({ data }) => {
    // Tính tổng số lượng để tính phần trăm
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const config = {
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.75,
        label: {
            type: 'outer',
            content: (datum: any) => {
                const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : 0;
                return `${datum.type}: ${datum.value} (${percent}%)`;
            },
            style: {
                fontSize: 12,
                textAlign: 'center',
            },
        },
        legend: {
            position: 'right' as const,
            offsetX: -20,
        },
        interactions: [{ type: 'element-active' as const }],
        tooltip: {
            customContent: (title: string, items: any[]) => {
                if (!items || items.length === 0) return '';
                const datum = items[0].data;
                const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : 0;
                return `<div style="padding:8px 12px"><b>${datum.type}</b><br/>Số lượng: ${datum.value}<br/>Tỷ lệ: ${percent}%</div>`;
            }
        },
    };
    return <Pie {...config} style={{ height: '300px' }} />;
};

// 4. Component Bảng Đơn hàng gần đây
const RecentOrdersTable: React.FC<{ data: any[] }> = ({ data }) => {
    const columns: TableProps<any>['columns'] = [
        { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
        { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
        // { title: 'Số tiền', dataIndex: 'amount', render: (val: number) => `${val.toLocaleString('vi-VN')} VNĐ` },
        {
            title: 'Trạng thái', dataIndex: 'status', render: (status: string) => {
                const statusMap: { [key: string]: { color: string; text: string } } = {
                    completed: { color: 'success', text: 'Hoàn thành' },
                    processing: { color: 'processing', text: 'Đang xử lý' },
                    cancelled: { color: 'error', text: 'Đã hủy' },
                };
                const { color, text } = statusMap[status] || { color: 'default', text: 'Không xác định' };
                return <Tag color={color}>{text}</Tag>;
            }
        },
        { title: 'Ngày', dataIndex: 'date', key: 'date', sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix() },
    ];
    return <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 5 }} />;
};

// 5. Component Danh sách Top
const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#FFD700', fontSize: '22px' }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: '20px' }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#CD7F32', fontSize: '18px' }} />;
    return <Text strong style={{ fontSize: '16px', width: '22px', textAlign: 'center', color: '#888' }}>{rank}</Text>;
};

const TopList: React.FC<{ title: string; data: any[]; icon: React.ReactNode; renderDescription: (item: any) => React.ReactNode }> = ({ title, data, icon, renderDescription }) => (
    <Card
        title={<Space>{icon}{title}</Space>}
        bordered={false}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}
        // extra={<Link>Xem tất cả</Link>}
    >
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
                <List.Item key={item.id}>
                    <Row align="middle" gutter={16} style={{ width: '100%' }}>
                        <Col span={2}>{getRankIcon(item.rank)}</Col>
                        <Col span={18}>
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.name.charAt(0)}</Avatar>}
                                title={<Text strong>{item.name}</Text>}
                                description={renderDescription(item)}
                            />
                        </Col>
                    </Row>
                </List.Item>
            )}
        />
    </Card>
);


// --- COMPONENT DASHBOARD CHÍNH ---
const Dashboard: React.FC = () => {
    // --- State cho khoảng ngày thống kê doanh thu ---
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'days'), dayjs()]);
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state: RootState) => state.category);
    const { products } = useSelector((state: RootState) => state.product);

    // --- Đơn hàng mới trong tháng này và tháng trước ---
    const [ordersThisMonth, setOrdersThisMonth] = useState(0);
    const [ordersLastMonth, setOrdersLastMonth] = useState(0);
    const [orderPercent, setOrderPercent] = useState(0);

    // --- Khách hàng mới trong tháng này và tháng trước ---
    const [newCustomersThisMonth, setNewCustomersThisMonth] = useState(0);
    const [newCustomersLastMonth, setNewCustomersLastMonth] = useState(0);
    const [customerPercent, setCustomerPercent] = useState(0);

    // --- Doanh thu tháng này và tháng trước ---
    const [revenueThisMonth, setRevenueThisMonth] = useState(0);
    const [revenueLastMonth, setRevenueLastMonth] = useState(0);
    const [revenuePercent, setRevenuePercent] = useState(0);

    // --- Top khách hàng thân thiết và sản phẩm bán chạy ---
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    // --- Đơn hàng trong ngày ---
    const [todayOrders, setTodayOrders] = useState<any[]>([]);

    // --- Dữ liệu doanh thu theo tháng ---
    const [salesData, setSalesData] = useState<any[]>([]);

    useEffect(() => {
        dispatch(fetchCategories() as any);
        dispatch(fetchProducts({ page: 1, limit: 1000 }) as any);
        const fetchCustomers = async () => {
            try {
                const res = await axiosClient.get('/users/get-all-users', { params: { page: 1, limit: 1000 } });
                const users = res.data || res.data?.data || res;
                const customers = (users.data || users);
                // --- Thống kê khách hàng mới theo khoảng ngày ---
                const start = dateRange[0].startOf('day');
                const end = dateRange[1].endOf('day');
                const rangeDays = end.diff(start, 'day') + 1;
                const prevStart = start.clone().subtract(rangeDays, 'day');
                const prevEnd = start.clone().subtract(1, 'day').endOf('day');
                let countThisRange = 0;
                let countPrevRange = 0;
                customers.forEach((user: any) => {
                    const created = dayjs(user.createdAt);
                    if (created.isSameOrAfter(start) && created.isSameOrBefore(end)) {
                        countThisRange++;
                    } else if (created.isSameOrAfter(prevStart) && created.isSameOrBefore(prevEnd)) {
                        countPrevRange++;
                    }
                });
                setNewCustomersThisMonth(countThisRange);
                setNewCustomersLastMonth(countPrevRange);
                if (countPrevRange === 0 && countThisRange > 0) {
                    setCustomerPercent(100);
                } else if (countPrevRange === 0 && countThisRange === 0) {
                    setCustomerPercent(0);
                } else {
                    setCustomerPercent(Math.round(((countThisRange - countPrevRange) / countPrevRange) * 100));
                }
            } catch (e) {
                setNewCustomersThisMonth(0);
                setNewCustomersLastMonth(0);
                setCustomerPercent(0);
            }
        };
        fetchCustomers();
    }, [dispatch, dateRange]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosClient.get('/order/admin/get-orders', { params: { page: 1, limit: 1000 } });
                const orderList = res.data;
                const orderArr = orderList.data || [];
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();
                const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
                let revenueThisRange = 0;
                let revenuePrevRange = 0;
                // Tính top khách hàng thân thiết
                const customerOrderCount: Record<string, { name: string, totalSpent: number, orders: number }> = {};
                const productSales: Record<string, { name: string, sales: number, revenue: number }> = {};
                orderArr.forEach((order: any) => {
                    // Khách hàng
                    const customerId = order.userID || order.customerId || order.customer?._id || order.shippingAddress?.receiverFullname || 'unknown';
                    const customerName = order.shippingAddress?.receiverFullname || 'Ẩn danh';
                    if (!customerOrderCount[customerId]) {
                        customerOrderCount[customerId] = { name: customerName, totalSpent: 0, orders: 0 };
                    }
                    customerOrderCount[customerId].orders++;
                    customerOrderCount[customerId].totalSpent += order.totalPrice || order.totalAmount || 0;
                    // Sản phẩm
                    (order.orderDetailItems || order.items || []).forEach((item: any) => {
                        const productId = item.productId || item.id || item.productName;
                        const productName = item.productName || 'Không rõ';
                        if (!productSales[productId]) {
                            productSales[productId] = { name: productName, sales: 0, revenue: 0 };
                        }
                        productSales[productId].sales += item.quantity || 1;
                        productSales[productId].revenue += (item.sellingPrice || item.promotionalPrice || 0) * (item.quantity || 1);
                    });
                });
                // Top khách hàng
                const topCustomersArr = Object.entries(customerOrderCount)
                    .map(([id, v]) => ({ id, ...v }))
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 5)
                    .map((item, idx) => ({ ...item, rank: idx + 1 }));
                setTopCustomers(topCustomersArr);
                // Top sản phẩm
                const topProductsArr = Object.entries(productSales)
                    .map(([id, v]) => ({ id, ...v }))
                    .sort((a, b) => b.sales - a.sales)
                    .slice(0, 5)
                    .map((item, idx) => ({ ...item, rank: idx + 1 }));
                setTopProducts(topProductsArr);
                // Đơn hàng trong ngày
                const today = now.getDate();
                const ordersToday = orderArr.filter((order: any) => {
                    const created = new Date(order.createdAt);
                    return created.getFullYear() === thisYear && created.getMonth() === thisMonth && created.getDate() === today;
                });
                setTodayOrders(ordersToday);
                // --- Thống kê doanh thu theo ngày trong khoảng dateRange ---
                const start = dateRange[0].startOf('day');
                const end = dateRange[1].endOf('day');
                const rangeDays = end.diff(start, 'day') + 1;
                const prevStart = start.clone().subtract(rangeDays, 'day');
                const prevEnd = start.clone().subtract(1, 'day').endOf('day');
                // Tạo map ngày -> doanh thu
                const dayMap: Record<string, { value: number; target: number }> = {};
                let cur = start.clone();
                while (cur.isSameOrBefore(end, 'day')) {
                    dayMap[cur.format('YYYY-MM-DD')] = { value: 0, target: 4000000 };
                    cur = cur.add(1, 'day');
                }
                // Map cho khoảng trước
                const prevDayMap: Record<string, { value: number }> = {};
                let prevCur = prevStart.clone();
                while (prevCur.isSameOrBefore(prevEnd, 'day')) {
                    prevDayMap[prevCur.format('YYYY-MM-DD')] = { value: 0 };
                    prevCur = prevCur.add(1, 'day');
                }
                orderArr.forEach((order: any) => {
                    const created = dayjs(order.createdAt);
                    const key = created.format('YYYY-MM-DD');
                    if (created.isSameOrAfter(start) && created.isSameOrBefore(end) && dayMap[key]) {
                        dayMap[key].value += order.totalPrice || order.totalAmount || 0;
                    }
                    if (created.isSameOrAfter(prevStart) && created.isSameOrBefore(prevEnd) && prevDayMap[key]) {
                        prevDayMap[key].value += order.totalPrice || order.totalAmount || 0;
                    }
                });
                // Tạo mảng dữ liệu cho biểu đồ, sắp xếp theo ngày tăng dần
                const salesArr = Object.entries(dayMap)
                    .map(([key, v]) => {
                        const value = typeof v.value === 'number' && !isNaN(v.value) ? v.value : 0;
                        console.log('Doanh thu ngày', key, 'là:', value, v);
                        return { date: dayjs(key).format('DD/MM'), value };
                    })
                    .sort((a, b) => dayjs(a.date, 'DD/MM').toDate().getTime() - dayjs(b.date, 'DD/MM').toDate().getTime());
                setSalesData(salesArr);
                // Tổng doanh thu trong khoảng hiện tại và khoảng trước
                revenueThisRange = Object.values(dayMap).reduce((sum, v) => sum + v.value, 0);
                revenuePrevRange = Object.values(prevDayMap).reduce((sum, v) => sum + v.value, 0);
                setRevenueThisMonth(revenueThisRange);
                setRevenueLastMonth(revenuePrevRange);
                if (revenuePrevRange === 0 && revenueThisRange > 0) {
                    setRevenuePercent(100);
                } else if (revenuePrevRange === 0 && revenueThisRange === 0) {
                    setRevenuePercent(0);
                } else {
                    setRevenuePercent(Math.round(((revenueThisRange - revenuePrevRange) / revenuePrevRange) * 100));
                }
            } catch (e) {
                setOrdersThisMonth(0);
                setOrdersLastMonth(0);
                setOrderPercent(0);
                setRevenueThisMonth(0);
                setRevenueLastMonth(0);
                setRevenuePercent(0);
                setTopCustomers([]);
                setTopProducts([]);
                setTodayOrders([]);
                setSalesData([]);
            }
        };
        fetchOrders();
    }, [dispatch, dateRange]);

    // Lọc các category cha
    const parentCategories = categories.filter(cat => cat.isRoot || !cat.parentId);

    // Map categoryId -> parentId (hoặc chính nó nếu là cha)
    const categoryIdToParentId: Record<string, string> = {};
    categories.forEach(cat => {
        if (cat.isRoot || !cat.parentId) {
            categoryIdToParentId[cat._id] = cat._id;
        } else {
            categoryIdToParentId[cat._id] = cat.parentId!;
        }
    });

    // Đếm số sản phẩm theo từng category cha
    const parentCategoryCount: Record<string, number> = {};
    products.forEach(product => {
        product.categories.forEach(cat => {
            const parentId = categoryIdToParentId[cat._id] || cat._id;
            parentCategoryCount[parentId] = (parentCategoryCount[parentId] || 0) + 1;
        });
    });
    const totalProducts = products.length;
    // Map sang dạng { type: tên danh mục cha, value: phần trăm }
    const categoryPieData = parentCategories.map(cat => ({
        type: cat.name,
        value: totalProducts > 0 ? Math.round((parentCategoryCount[cat._id] || 0) / totalProducts * 100) : 0
    })).filter(item => item.value > 0);

    // Thay đổi khoảng ngày
    const handleDateChange = (dates: any) => {
        if (dates) {
            setDateRange(dates);
        }
    };
    
    return (
        <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px', background: '#f0f2f5' }}>
            {/* Stat Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard icon={<DollarOutlined />} title="Tổng Doanh Thu" value={revenueThisMonth} trend={revenuePercent} color="#52c41a" unit="VNĐ" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard icon={<ShoppingCartOutlined />} title="Đơn Hàng Mới" value={ordersThisMonth} trend={orderPercent} color="#1890ff" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard icon={<UserOutlined />} title="Khách Hàng Mới" value={newCustomersThisMonth} trend={customerPercent} color="#722ed1" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard icon={<RiseOutlined />} title="Tỷ Lệ Chuyển Đổi" value="15.2" trend={2} color="#fa8c16" unit="%" />
                </Col>
            </Row>

            {/* Main Charts */}
            <Row gutter={[24, 24]}>
                <Col xl={24} lg={16}>
                    <Card
                        title={<Space><LineChartOutlined /> Biểu đồ Doanh thu</Space>}
                        bordered={false}
                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        extra={
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateChange}
                                allowClear={false}
                                format="DD/MM/YYYY"
                                style={{ marginBottom: 8 }}
                            />
                        }
                    >
                        <RevenueChart data={salesData} />
                    </Card>
                </Col>
                {/* <Col xs={24} lg={8}>
                    <Card
                        title={<Space><PieChartOutlined /> Phân bố Doanh thu theo Danh mục</Space>}
                        bordered={false}
                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                        <CategoryPieChart data={categoryPieData} />
                    </Card>
                </Col> */}
            </Row>

            {/* Recent Orders */}
            {/* <Row>
                <Col span={24}>
                     <Card
                        title="Đơn hàng trong ngày"
                        bordered={false}
                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        extra={<Button type="primary">Xem tất cả đơn hàng</Button>}
                    >
                        <RecentOrdersTable data={todayOrders} />
                    </Card>
                </Col>
            </Row> */}

            {/* Top Lists */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <TopList
                        title="Top Khách Hàng Thân Thiết"
                        icon={<UserOutlined style={{ color: '#1890ff' }} />}
                        data={topCustomers}
                        renderDescription={(item) => (
                            <Text type="secondary">
                                <DollarOutlined /> {item.totalSpent.toLocaleString('vi-VN')} VNĐ ({item.orders} đơn)
                            </Text>
                        )}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <TopList
                        title="Top Sản Phẩm Bán Chạy"
                        icon={<FireOutlined style={{ color: '#f5222d' }} />}
                        data={topProducts}
                        renderDescription={(item) => (
                            <Text type="secondary">
                                <ShoppingCartOutlined /> {item.sales} đã bán • <DollarOutlined /> {item.revenue.toLocaleString('vi-VN')} VNĐ
                            </Text>
                        )}
                    />
                </Col>
            </Row>

        </Space>
    );
};

export default Dashboard;