import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Card, Button, Space, Input, Modal, Form, Select,
  Typography, Divider, Tag, App, Col, Row, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
  type Category, CategoryType
} from '../features/category/categorySlice';

const { Title } = Typography;
const { Option } = Select;

// --- HELPER FUNCTION: Recursively filter the category tree ---
const filterTree = (tree: Category[], searchText: string): Category[] => {
  if (!searchText) return tree;

  return tree.reduce((acc, node) => {
    const nodeNameMatches = node.name.toLowerCase().includes(searchText.toLowerCase());

    if (node.children) {
      const filteredChildren = filterTree(node.children, searchText);
      if (nodeNameMatches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    } else if (nodeNameMatches) {
      acc.push(node);
    }
    
    return acc;
  }, [] as Category[]);
};

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories = [], loading } = useSelector((state: RootState) => state.category);
  const { message } = App.useApp(); // Use Ant Design's App context for messages
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const categoryTree = useMemo(() => {
    const buildTree = (list: Category[]): Category[] => {
      const map: { [key: string]: Category & { children?: Category[] } } = {};
      const roots: Category[] = [];

      list.forEach(item => {
        map[item._id] = { ...item, children: [] };
      });

      list.forEach(item => {
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children?.push(map[item._id]);
        } else {
          roots.push(map[item._id]);
        }
      });
      
      // Remove empty children arrays
      Object.values(map).forEach(node => {
        if (node.children?.length === 0) delete node.children;
      });

      return roots.sort((a, b) => a.name.localeCompare(b.name));
    };

    return buildTree(categories);
  }, [categories]);

  const displayedCategories = useMemo(() => filterTree(categoryTree, searchText), [categoryTree, searchText]);

  const handleShowModal = (category: Category | null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({ name: category.name });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, name: values.name })).unwrap();
        message.success('Cập nhật danh mục thành công');
      } else {
        const categoryData = {
          name: values.name,
          isRoot: values.isRoot,
          parentId: values.isRoot ? undefined : values.parentId,
          ...(values.isRoot && { categoryType: values.categoryType }),
        };
        await dispatch(createCategory(categoryData)).unwrap();
        message.success('Thêm danh mục thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Thao tác thất bại.');
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Xóa danh mục thành công');
    } catch (error: any) {
      message.error(error.message || 'Xóa danh mục thất bại');
    }
  };
  
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'categoryType',
      key: 'categoryType',
      render: (type: CategoryType) => {
        if (!type) return '-';
        const typeMap: Record<CategoryType, {color: string, text: string}> = {
            [CategoryType.DOG]: { color: 'blue', text: 'Chó' },
            [CategoryType.CAT]: { color: 'green', text: 'Mèo' },
            [CategoryType.OTHER]: { color: 'orange', text: 'Khác' },
        };
        return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
      },
    },
    {
      title: 'Danh mục gốc',
      dataIndex: 'isRoot',
      key: 'isRoot',
      render: (isRoot: boolean) => <Tag color={isRoot ? 'success' : 'default'}>{isRoot ? 'Có' : 'Không'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: any, record: Category) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa danh mục?"
            description="Hành động này không thể hoàn tác. Bạn chắc chắn chứ?"
            onConfirm={() => handleDeleteConfirm(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input
              placeholder="Tìm kiếm danh mục"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowModal(null)}>
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
        pagination={false}
        expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
            record.children && record.children.length > 0 ? (
                <DownOutlined
                    onClick={e => onExpand(record, e)}
                    style={{
                        transition: 'transform 0.2s',
                        transform: `rotate(${expanded ? 0 : -90}deg)`,
                    }}
                />
            ) : null,
        }}
        components={{
            header: {
              cell: (props: any) => <th {...props} style={{ background: '#f0f5ff', color: '#333', fontWeight: 600 }} />,
            },
        }}
      />

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="category_form" initialValues={{ isRoot: true }}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Thức ăn cho chó, Vòng cổ..." />
          </Form.Item>

          {!editingCategory && (
            <>
              <Divider />
              <Form.Item name="isRoot" label="Loại danh mục" rules={[{ required: true }]}>
                <Select>
                  <Option value={true}>Danh mục gốc (Cấp 1)</Option>
                  <Option value={false}>Danh mục con (Cấp 2)</Option>
                </Select>
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, current) => prev.isRoot !== current.isRoot}>
                {({ getFieldValue }) =>
                  getFieldValue('isRoot') === true ? (
                    <Form.Item name="categoryType" label="Loại thú cưng" rules={[{ required: true }]}>
                      <Select placeholder="Chọn loại thú cưng cho danh mục gốc">
                        <Option value={CategoryType.DOG}>Chó</Option>
                        <Option value={CategoryType.CAT}>Mèo</Option>
                        <Option value={CategoryType.OTHER}>Khác</Option>
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item name="parentId" label="Danh mục cha" rules={[{ required: true }]}>
                      <Select placeholder="Chọn danh mục cha">
                        {categories.filter(cat => cat.isRoot).map(cat => (
                          <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )
                }
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

// Wrap with <App> for message context
const CategoriesPage = () => (
    <App>
        <Categories />
    </App>
);

export default CategoriesPage;