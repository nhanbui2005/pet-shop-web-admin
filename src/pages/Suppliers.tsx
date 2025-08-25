import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  Col,
  Row,
  Popconfirm,
  Upload,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSuppliers, createSupplier, updateSupplier, type Supplier, deleteSupplier } from '../features/supplier/supplierSlice';

const { Title } = Typography;

const Suppliers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers = [], loading } = useSelector((state: RootState) => state.supplier);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
  
      const formData = new FormData();
      
      // Create data object with supplier information matching SupplierDto
      const supplierData = {
        name: values.name,
        description: values.description
      };
      
      // Append data as JSON string
      formData.append('data', JSON.stringify(supplierData));
      
      // Handle image
      if (imageFile instanceof File) {
        formData.append('image', imageFile);
      }
  
      if (editingSupplier) {
        const result = await dispatch(updateSupplier({
          id: editingSupplier._id,
          data: formData,
        })).unwrap();
  
        setIsModalVisible(false);
        message.success('Cập nhật nhà cung cấp thành công');
        form.resetFields();
        setEditingSupplier(null);
        setImageFile(null);
        setPreviewImage(null);
        dispatch(fetchSuppliers());
      } else {
        const action = await dispatch(createSupplier(formData))
        if (createSupplier.fulfilled.match(action)) {
          setIsModalVisible(false);
          message.success('Thêm nhà cung cấp thành công');
          form.resetFields();
          setEditingSupplier(null);
          setImageFile(null);
          setPreviewImage(null);
          dispatch(fetchSuppliers());
        } else {
          message.error( 'Có lỗi xảy ra khi thêm mới');
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý form:', error);
      message.error('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue({
      name: supplier.name,
      description: supplier.description,
    });
    if (supplier.image) {
      setPreviewImage(supplier.image);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await dispatch(deleteSupplier(id)).unwrap()
      if (result.success) {
        message.success('Xóa nhà cung cấp thành công');
        dispatch(fetchSuppliers());
      } else {
        message.error(result.errors?.[0] || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error('Có lỗi xảy ra khi xóa nhà cung cấp');
    }
  };

  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Supplier, b: Supplier) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        image ? <Image src={image} alt="supplier" width={50} /> : '-'
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Supplier) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {/* <Popconfirm
            title="Xóa nhà cung cấp"
            description="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm nhà cung cấp"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingSupplier(null);
                  form.resetFields();
                  setImageFile(null);
                  setPreviewImage(null);
                  setIsModalVisible(true);
                }}
              >
                Thêm nhà cung cấp
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="_id"
          loading={loading}
          bordered
          style={{ backgroundColor: '#f0f2f5' }}
          className="custom-table"
        />
      </Card>

      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingSupplier(null);
          setImageFile(null);
          setPreviewImage(null);
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh nhà cung cấp"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = (e) => { setPreviewImage(e.target?.result as string); };
                reader.readAsDataURL(file);
                return false;
              }}
              onRemove={() => { setImageFile(null); setPreviewImage(null); }}
            >
              {imageFile || previewImage ? (
                <img src={previewImage || undefined} alt="preview" style={{ width: '100%' }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;