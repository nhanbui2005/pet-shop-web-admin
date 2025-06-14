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
  Divider,
  Tag,
  App,
  Col,
  Row,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  CategoryType
} from '../features/category/categorySlice';
import './Categories.css';

const { Title } = Typography;
const { Option } = Select;

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories = [], loading } = useSelector((state: RootState) => state.category);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const buildCategoryTree = (flatList: Category[]): Category[] => {
    const map: { [key: string]: Category & { children?: Category[] } } = {};

    flatList.forEach(category => {
      map[category._id] = { ...category };
      map[category._id].children = [];
    });

    const rootNodes: Category[] = [];

    flatList.forEach(category => {
      if (category.parentId && map[category.parentId]) {
        map[category.parentId].children?.push(map[category._id]);
      } else {
        rootNodes.push(map[category._id]);
      }
    });

    Object.values(map).forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        node.children.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    return rootNodes.filter(node => !node.parentId).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingCategory) {
        const resultAction = await dispatch(updateCategory({
          id: editingCategory._id,
          name: values.name,
        }));

        if (updateCategory.fulfilled.match(resultAction)) {
          setIsModalVisible(false);
          message.success('Cập nhật danh mục thành công')
          form.resetFields();
          setEditingCategory(null);
          dispatch(fetchCategories());
        } else if (updateCategory.rejected.match(resultAction)) {
          message.error(resultAction.error.message || 'Có lỗi xảy ra khi cập nhật.');
        }
      } else {
        const categoryData = {
          name: values.name,
          isRoot: values.isRoot,
          parentId: values.isRoot ? undefined : values.parentId,
          ...(values.isRoot && { categoryType: values.categoryType }),
        };

        const resultAction = await dispatch(createCategory(categoryData));
        if (createCategory.fulfilled.match(resultAction)) {
          const result = resultAction.payload;
          if (result.success) {
            message.success('Thêm danh mục thành công');
            dispatch(fetchCategories()); // Always reload categories after successful create
            setIsModalVisible(false);
            form.resetFields();
            setEditingCategory(null);
          } else {
            message.error(result.errors?.[0] || 'Có lỗi xảy ra khi thêm danh mục.');
          }
        } else if (createCategory.rejected.match(resultAction)) {
          message.error(resultAction.error.message || 'Có lỗi xảy ra khi thêm mới.');
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        console.log('Validation failed:', error.errorFields);
      } else {
        console.log('mmmm', error);
        
        message.error(error.message || 'Có lỗi xảy ra.');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteCategory(id));
      if (deleteCategory.fulfilled.match(resultAction)) {
        message.success('Xóa danh mục thành công');
        // Không cần re-fetch ở đây vì slice đã tự lọc bỏ.
      } else if (deleteCategory.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload as string;
        message.error(errorPayload || resultAction.error.message || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
  };

  const getCategoryTypeColor = (type: CategoryType) => {
    switch (type) {
      case CategoryType.DOG:
        return 'blue';
      case CategoryType.CAT:
        return 'green';
      case CategoryType.OTHER:
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      render: (text: string, record: Category) => (
        <Space>
          {record.parentId && <CaretRightOutlined style={{ marginRight: 4, color: '#1890ff' }} />}
          {text}
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'categoryType',
      key: 'categoryType',
      render: (type: CategoryType) => type ? (
        <Tag color={getCategoryTypeColor(type)}>
          {type === CategoryType.DOG && 'Chó'}
          {type === CategoryType.CAT && 'Mèo'}
          {type === CategoryType.OTHER && 'Khác'}
        </Tag>
      ) : '-',
      filters: Object.values(CategoryType).map(type => ({
        text: type === CategoryType.DOG ? 'Chó' :
              type === CategoryType.CAT ? 'Mèo' : 'Khác',
        value: type
      })),
      onFilter: (value: any, record: Category) => record.categoryType === value,
    },
    {
      title: 'Danh mục gốc',
      dataIndex: 'isRoot',
      key: 'isRoot',
      render: (isRoot: boolean) => (
        <Tag color={isRoot ? 'green' : 'blue'}>
          {isRoot ? 'Có' : 'Không'}
        </Tag>
      ),
      filters: [
        { text: 'Có', value: true },
        { text: 'Không', value: false },
      ],
      onFilter: (value: any, record: Category) => record.isRoot === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này? Thao tác này có thể ảnh hưởng đến các danh mục con và sản phẩm liên quan."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hierarchicalCategories = buildCategoryTree(categories);

  const handleRowClick = (record: Category) => {
    if (record.children && record.children.length > 0) {
      const key = record._id;
      const isExpanded = expandedKeys.includes(key);
      if (isExpanded) {
        setExpandedKeys(expandedKeys.filter(item => item !== key));
      } else {
        setExpandedKeys([...expandedKeys, key]);
      }
    }
  };

  const displayedCategories = hierarchicalCategories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card className="p-6 rounded-lg shadow-md">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} className="text-gray-800">Quản lý danh mục</Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm danh mục"
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                className="rounded-md"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCategory(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md shadow-sm"
              >
                Thêm danh mục
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={displayedCategories}
          rowKey="_id"
          loading={loading}
          bordered
          style={{ backgroundColor: '#fff' }}
          className="custom-table"
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
          }}
          onRow={(record) => ({
            onClick: () => {
              handleRowClick(record);
            },
          })}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        width={600}
        maskClosable={false}
        destroyOnClose={true}
        className="rounded-lg shadow-xl"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isRoot: true }}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
            className="mb-4"
          >
            <Input placeholder="Nhập tên danh mục" className="rounded-md" />
          </Form.Item>

          {!editingCategory && (
            <>
              <Divider orientation="left" className="my-6 text-gray-600">Cấu hình danh mục</Divider>

              <Form.Item
                name="isRoot"
                label="Loại danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn loại danh mục' }]}
                className="mb-4"
              >
                <Select placeholder="Chọn loại danh mục" className="rounded-md">
                  <Option value={true}>Danh mục gốc</Option>
                  <Option value={false}>Danh mục con</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.isRoot !== currentValues.isRoot}
              >
                {({ getFieldValue }) => {
                  const isRoot = getFieldValue('isRoot');
                  return isRoot ? (
                    <Form.Item
                      name="categoryType"
                      label="Loại thú cưng"
                      rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng' }]}
                      className="mb-4"
                    >
                      <Select placeholder="Chọn loại thú cưng" className="rounded-md">
                        <Option value={CategoryType.DOG}>Chó</Option>
                        <Option value={CategoryType.CAT}>Mèo</Option>
                        <Option value={CategoryType.OTHER}>Khác</Option>
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name="parentId"
                      label="Danh mục cha"
                      rules={[{ required: true, message: 'Vui lòng chọn danh mục cha' }]}
                      className="mb-4"
                    >
                      <Select placeholder="Chọn danh mục cha" className="rounded-md">
                        {categories
                          .filter(cat => cat.isRoot)
                          .map(category => (
                            <Option key={category._id} value={category._id}>
                              {category.name} ({category.categoryType === CategoryType.DOG ? 'Chó' :
                                             category.categoryType === CategoryType.CAT ? 'Mèo' : 'Khác'})
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
