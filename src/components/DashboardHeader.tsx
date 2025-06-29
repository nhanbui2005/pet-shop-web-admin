import React from 'react';
import { Row, Col, Typography, DatePicker, Button, Space, Segmented, Card } from 'antd';
import { SyncOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardHeaderProps {
    dateRange: [Dayjs, Dayjs];
    onDateChange: (dates: any) => void;
    onQuickFilterChange: (value: string) => void;
    onRefresh: () => void;
    loading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    dateRange,
    onDateChange,
    onQuickFilterChange,
    onRefresh,
    loading,
}) => {
    return (
        <Card bordered={false} style={{ borderRadius: 12, background: '#fff', padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                {/* Phần tiêu đề */}
                <Col>
                    <Title level={2} style={{ margin: 0 }}>Bảng điều khiển</Title>
                    <Text type="secondary">
                        Dữ liệu được hiển thị từ {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}
                    </Text>
                </Col>

                {/* Phần bộ lọc và hành động */}
                <Col>
                    <Space size="middle" wrap>
                        <Segmented
                            options={[
                                { label: 'Tuần này', value: 'this_week' },
                                { label: 'Tháng này', value: 'this_month' },
                                { label: 'Năm này', value: 'this_year' },
                            ]}
                            onChange={onQuickFilterChange}
                        />
                        <RangePicker value={dateRange} onChange={onDateChange} />
                        <Button icon={<SyncOutlined />} onClick={onRefresh} loading={loading}>
                            Làm mới
                        </Button>
                        <Button type="primary" icon={<DownloadOutlined />}>
                            Xuất báo cáo
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};