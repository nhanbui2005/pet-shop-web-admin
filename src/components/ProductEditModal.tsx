import React, { useEffect, useState } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, message } from 'antd';
import CategorySelect from './CategorySelect';

const { Option } = Select;

interface ProductEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
  suppliers: any[];
  allCategories: any[];
  editingProduct: any;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
  suppliers,
  allCategories,
  editingProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (editingProduct && visible) {
      // Set giá trị mặc định cho form
      const categoryId = editingProduct.categories && editingProduct.categories.length > 0 
        ? editingProduct.categories[0]._id 
        : '';
      
      // Xử lý supplier - đảm bảo luôn lấy ID
      // let supplierId = '';
      // if (editingProduct.supplier) {
      //   if (typeof editingProduct.supplier === 'object' && editingProduct.supplier._id) {
      //     // Nếu supplier là object có _id
      //     supplierId = editingProduct.supplier._id;
      //   } else if (typeof editingProduct.supplier === 'string') {
      //     // Nếu supplier là string (tên), tìm ID dựa trên tên
      //     const foundSupplier = suppliers.find(s => s.name === editingProduct.supplier);
      //     supplierId = foundSupplier?._id || '';
      //     // console.log('Found supplier by name:', foundSupplier);
      //   }
      // }
      
      // console.log('EditingProduct supplier:', editingProduct.supplier);
      // console.log('Extracted supplierId:', supplierId);
      
      setSelectedCategory(categoryId);
      
      // Reset form trước khi set giá trị mới
      form.resetFields();
      
      // Đợi một chút để form được reset hoàn toàn
      setTimeout(() => {
        try {
          form.setFieldsValue({
            name: editingProduct.name,
            categoryId: categoryId,
            // supplier: supplierId, // Commented out as per edit hint
            status: editingProduct.isActivate ? 'active' : 'inactive',
          });
        } catch (error) {
          console.error('Error setting form values:', error);
        }
      }, 50);
    }
    
    // Cleanup function khi modal đóng
    return () => {
      if (!visible) {
        try {
          form.resetFields();
          setSelectedCategory('');
        } catch (error) {
          console.error('Error cleaning up form:', error);
        }
      }
    };
  }, [editingProduct, visible, form]);

  const handleSubmit = async (values: any) => {
    try {
      // console.log('Form values:', values);
      
      const payload = {
        name: values.name,
        isActivate: values.status === 'active',
        categories: [values.categoryId],
      };
      
      // console.log('Payload to send:', payload);
      // console.log('Supplier ID type:', typeof values.supplier);
      // console.log('Supplier ID value:', values.supplier);

      // Gọi onFinish và đợi kết quả
      await onFinish(payload);
      
      // Không cần làm gì thêm ở đây vì onFinish sẽ xử lý việc đóng modal
    } catch (error) {
      console.error('Submit error:', error);
      // Nếu có lỗi, hiển thị message và giữ modal mở
      message.error('Có lỗi xảy ra khi cập nhật sản phẩm!');
    }
  };

  return (
    <Modal
      key={`edit-modal-${editingProduct?._id || 'new'}`}
      title="Chỉnh sửa sản phẩm"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose={true}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <CategorySelect 
                onChange={(value) => {
                  setSelectedCategory(value);
                  form.setFieldValue('categoryId', value);
                }} 
                value={selectedCategory}
                allowAnyLevel={true}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="supplier"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
            >
              <Select placeholder="Chọn nhà cung cấp">
                {suppliers.map((supplier) => (
                  <Option key={supplier._id} value={supplier._id}>{supplier.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row> */}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                <Option value="active">Đang bán</Option>
                <Option value="inactive">Ngừng bán</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductEditModal;
