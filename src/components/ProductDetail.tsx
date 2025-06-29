import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Image,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Table,
} from 'antd';

interface ProductDetailProps {
  isVisible: boolean;
  onClose: () => void;
  product: any | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  isVisible,
  onClose,
  product,
}) => {
  if (!product) {
    return null;
  }

  const getUnitValueForGroup = (variant: any, groupName: string) => {
    if (!Array.isArray(product.variantGroups) || !Array.isArray(variant?.unitValues)) {
      return '';
    }

    const targetGroup = product.variantGroups.find((group: any) => group.groupName === groupName);
    if (!targetGroup || !Array.isArray(targetGroup.units)) {
      return 'N/A';
    }

    const matchingUnit = variant.unitValues.find((variantUnit: any) => {
      return targetGroup.units.some((groupUnit: any) => {
        return groupUnit._id === variantUnit._id;
      });
    });

    const result = matchingUnit?.unitName || 'N/A';
    return result;
  };

  const variantGroupColumns = Array.isArray(product.variantGroups)
    ? product.variantGroups.map((group: any) => ({
        title: group.groupName || 'N/A',
        dataIndex: 'unitValues',
        key: group._id,
        width: 120,
        render: (_: any, variant: any) => {
          const value = getUnitValueForGroup(variant, group.groupName);
          return value;
        },
      }))
    : [];

  const variantColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (sku: string) => sku || 'N/A',
    },
    ...variantGroupColumns,
    {
      title: 'Giá nhập',
      dataIndex: 'importPrice',
      key: 'importPrice',
      width: 120,
      render: (price: number) => (price != null ? `${price.toLocaleString('vi-VN')} VNĐ` : 'N/A'),
    },
    {
      title: 'Giá bán',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 120,
      render: (price: number) => (
        <Typography.Text type="danger" strong>
          {price != null ? `${price.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
        </Typography.Text>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock: number) => (
        <Typography.Text strong>
          {stock != null ? `${stock} sản phẩm` : 'N/A'}
        </Typography.Text>
      ),
    },
  ];

  const totalStock = Array.isArray(product.variants)
    ? product.variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0)
    : 0;

  return (
    <Modal
      title="Chi tiết sản phẩm"
      open={isVisible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Tên sản phẩm" span={2}>
          <Typography.Title level={4}>{product.name || 'N/A'}</Typography.Title>
        </Descriptions.Item>

        <Descriptions.Item label="Danh mục" span={2}>
          <Space>
            {Array.isArray(product.categories) && product.categories.length > 0 ? (
               product.categories.map((cat: any, index: number) => (
                 <Tag key={index} color="blue">
                   {cat.name || 'N/A'}
                 </Tag>
               ))
             ) : (
               <Tag color="default">Không có danh mục</Tag>
             )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag color={product.isActivate ? 'success' : 'default'}>
            {product.isActivate ? 'Đang bán' : 'Ngừng bán'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Giá bán">
          <Typography.Text type="danger" strong>
            {product.maxSellingPrice != null
               ? `${product.maxSellingPrice.toLocaleString('vi-VN')} VNĐ`
               : 'N/A'}
          </Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Giá khuyến mãi">
          <Typography.Text type="danger" delete>
            {product.maxPromotionalPrice != null
               ? `${product.maxPromotionalPrice.toLocaleString('vi-VN')} VNĐ`
               : 'N/A'}
          </Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Tồn kho">
          <Typography.Text strong>
            {totalStock != null ? `${totalStock} sản phẩm` : 'N/A'}
          </Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Hình ảnh" span={2}>
          <Image.PreviewGroup>
            <Space wrap>
              {Array.isArray(product.images) && product.images.length > 0 ? (
                 product.images.map((image: string, index: number) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Product ${index + 1}`}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
               ))
             ) : (
               <Typography.Text>Không có hình ảnh</Typography.Text>
             )}
            </Space>
          </Image.PreviewGroup>
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả" span={2}>
          {Array.isArray(product.descriptions) && product.descriptions.length > 0 ? (
             product.descriptions.map((desc: any, index: number) => (
                <div key={index} style={{ marginBottom: 16 }}>
                 <Typography.Title level={5}>{desc.title || 'N/A'}</Typography.Title>
                  <div
                    dangerouslySetInnerHTML={{ __html: desc.content || '' }}
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                    }}
                  />
                </div>
           ))
         ) : (
           <Typography.Text>Không có mô tả</Typography.Text>
         )}
        </Descriptions.Item>

        <Descriptions.Item label="Phân loại hàng" span={2}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.isArray(product.variantGroups) && product.variantGroups.length > 0 ? (
               product.variantGroups.map((group: any, index: number) => (
                  <Card
                    key={group._id}
                    size="small"
                    style={{
                      marginBottom: 8,
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Typography.Title level={5} style={{ marginBottom: 16 }}>
                         {group.groupName || 'N/A'}
                        </Typography.Title>
                        <Space wrap>
                         {Array.isArray(group.units) && group.units.length > 0 ? (
                          group.units.map((unit: any) => {
                             return <Tag key={unit._id}>{unit.unitName || 'N/A'}</Tag>;
                           })

                         ) : (
                           <Tag color="default">Không có đơn vị</Tag>
                         )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
               ))
             ) : (
               <Typography.Text>Không có phân loại hàng</Typography.Text>
             )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Các biến thể" span={2}>
          <Table
            dataSource={Array.isArray(product.variants) ? product.variants : []}
            columns={variantColumns}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="small"
            locale={{ emptyText: 'Không có biến thể' }}
          />
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ProductDetail;