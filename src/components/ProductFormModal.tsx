import React from 'react';
import { Modal, Form, Tabs, Row, Col, Input, Select, Upload, Button, Card, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CategorySelect from './CategorySelect';
import TinyMCEEditor from './TinyMCEEditor';

const { Option } = Select;

const ProductFormModal = ({
  visible,
  onCancel,
  onFinish,
  form,
  attributes,
  setAttributes,
  variants,
  setVariants,
  suppliers,
  allCategories,
  selectedCategory,
  setSelectedCategory,
  attributeValueInputs,
  setAttributeValueInputs,
  activeTab,
  setActiveTab,
  renderAttributeFields,
  getVariantColumns,
}) => (
  <Modal
    title={form.getFieldValue('id') ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
    open={visible}
    onCancel={onCancel}
    width={1000}
    footer={null}
  >
    <Form
      form={form}
      layout="vertical"
      initialValues={{ status: 'active' }}
      onFinish={onFinish}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Thông tin cơ bản" key="1">
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <CategorySelect onChange={setSelectedCategory} value={selectedCategory} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name="supplier"
                label="Nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {suppliers.map((supplier) => (
                    <Option key={supplier._id} value={supplier}>{supplier.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="images"
                label="Hình ảnh sản phẩm"
                rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh' }]}
                valuePropName="fileList"
                getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
              >
                <Upload
                  listType="picture-card"
                  multiple
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.List name="descriptions">
                {(fields, { add, remove }) => (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>Thêm mô tả</Button>
                    </div>
                    {fields.map((field, idx) => (
                      <Card key={`desc-${field.name}`} size="small" style={{ marginBottom: 8 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'title']}
                          rules={[{ required: true, message: 'Nhập tiêu đề mô tả' }]}
                          label={`Tiêu đề #${idx + 1}`}
                        >
                          <Input placeholder="Tiêu đề" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'content']}
                          rules={[{ required: true, message: 'Nhập nội dung mô tả' }]}
                          label="Nội dung"
                        >
                          <TinyMCEEditor />
                        </Form.Item>
                        <div style={{ textAlign: 'right' }}>
                          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Form.List>
            </Col>
          </Row>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button type="primary" onClick={() => {
              form.validateFields(["name", "categoryId", "supplier", "status", "images", "descriptions"]).then(() => setActiveTab('2'));
            }}>
              Tiếp tục
            </Button>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Phân loại hàng" key="2">
          {renderAttributeFields()}
          <div style={{ marginTop: 24 }}>
            <h3>Danh sách phân loại hàng</h3>
            <Table
              columns={getVariantColumns()}
              dataSource={variants}
              rowKey="id"
              pagination={false}
              scroll={{ y: 300 }}
              size="small"
              locale={{
                emptyText: 'Vui lòng thêm thuộc tính để tạo phân loại hàng'
              }}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              Tạo sản phẩm
            </Button>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Form>
  </Modal>
);

export default ProductFormModal; 