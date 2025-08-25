import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Card, Button, Space, Input, Modal, Form, Select,
  Typography, Row, App, Col, Menu, Tabs
} from 'antd';
import {
  PlusOutlined, EditOutlined, SearchOutlined, DownOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
  type Category
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
  const { message } = App.useApp();

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [isRootModalVisible, setIsRootModalVisible] = useState(false);
  const [rootForm] = Form.useForm();
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, parentId: string | null, level: 2 | 3 | null }>({ visible: false, x: 0, y: 0, parentId: null, level: null });
  const [contextForm] = Form.useForm();
  const [isContextModalVisible, setIsContextModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const rootCategories = useMemo(() => categories.filter(cat => !cat.parentId), [categories]);

  useEffect(() => {
    if (rootCategories.length > 0 && !activeRootId) {
      setActiveRootId(rootCategories[0]._id);
    }
  }, [rootCategories, activeRootId]);

  const activeRoot = useMemo(
    () => rootCategories.find(cat => cat._id === activeRootId),
    [rootCategories, activeRootId]
  );

  const displayedCategories = useMemo(
    () => (activeRoot?.children || []),
    [activeRoot]
  );

  const handleShowModal = (category: Category | null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({ name: category.name, parentId: category.parentId || null });
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
        await dispatch(fetchCategories()); // reload sau khi cập nhật
      } else {
        let parentId: string | undefined;
        if (values.parentIdLv2) {
          parentId = values.parentIdLv2;
        } else if (activeRootId) {
          parentId = activeRootId;
        }
        const isRoot = parentId === undefined;
        const categoryData = { name: values.name, isRoot: isRoot, parentId: parentId };
        if (isRoot) {
          message.success('Thêm danh mục gốc thành công');
        } else {
          message.success('Thêm danh mục con thành công');
        }
        await dispatch(createCategory(categoryData)).unwrap();
        await dispatch(fetchCategories()); // reload sau khi thêm
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
      await dispatch(fetchCategories()); // reload sau khi xóa
    } catch (error: any) {
      message.error(error.message || 'Xóa danh mục thất bại');
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => {
        let isLevel2 = record.parentId === activeRootId;
        return (
          <span style={{ fontWeight: isLevel2 ? 600 : 400 }}>
            {text}
          </span>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: any, record: Category) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleShowModal(record)}>Sửa</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ ...contextMenu, visible: false });
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleHeaderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, parentId: activeRootId, level: 2 });
  };

  const handleRowContextMenu = (record: Category) => (e: React.MouseEvent) => {
    if (record.parentId === activeRootId) {
      e.preventDefault();
      if (record.children && record.children.length > 0) {
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, parentId: record._id, level: 3 });
      } else {
        const categoryName = prompt('Nhập tên danh mục cấp 3:');
        if (categoryName && categoryName.trim()) {
          dispatch(createCategory({ name: categoryName.trim(), isRoot: false, parentId: record._id }))
            .unwrap()
            .then(async () => {
              message.success('Tạo danh mục cấp 3 thành công');
              await dispatch(fetchCategories()); // reload sau khi tạo
            })
            .catch((error: any) => {
              message.error(error.message || 'Thao tác thất bại.');
            });
        }
      }
    }
  };

  const handleContextMenuClick = () => {
    setIsContextModalVisible(true);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleContextCreate = async () => {
    try {
      const values = await contextForm.validateFields();
      const categoryData: any = { name: values.name, isRoot: false };
      if (contextMenu.parentId) {
        categoryData.parentId = contextMenu.parentId;
      }
      await dispatch(createCategory(categoryData)).unwrap();
      message.success('Tạo danh mục thành công');
      await dispatch(fetchCategories()); // reload sau khi tạo từ context
      setIsContextModalVisible(false);
      contextForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Thao tác thất bại.');
    }
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRootModalVisible(true)}>
            Thêm danh mục gốc
          </Button>
        </Col>
      </Row>

      <Tabs activeKey={activeRootId || ''} onChange={setActiveRootId} type="card"
        items={rootCategories.map(root => ({ key: root._id, label: root.name }))}
        style={{ marginBottom: 16 }}
      />

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input placeholder="Tìm kiếm danh mục" prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }} allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleShowModal(null)}>
              Thêm danh mục
            </Button>
          </Space>
        </Col>
      </Row>

      <div style={{ position: 'relative' }}>
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
                    transform: `rotate(${expanded ? 0 : -90}deg)`
                  }}
                />
              ) : null,
          }}
          components={{
            header: {
              cell: (props: any) => (
                <th {...props}
                  style={{ background: '#f0f5ff', color: '#333', fontWeight: 600 }}
                  onContextMenu={handleHeaderContextMenu}
                />
              ),
            },
            body: {
              row: (props: any) => {
                const { record, ...restProps } = props;
                return (
                  <tr {...restProps} onContextMenu={handleRowContextMenu(record)} />
                );
              },
            },
          }}
        />

        {contextMenu.visible && (
          <Menu
            style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 10000 }}
            onClick={handleContextMenuClick}
            items={[{ key: 'create', label: contextMenu.level === 2 ? 'Tạo danh mục cấp 2' : 'Tạo danh mục cấp 3' }]}
          />
        )}
      </div>

      {/* Modal thêm danh mục gốc */}
      <Modal title="Thêm danh mục gốc"
        open={isRootModalVisible}
        onOk={async () => {
          try {
            const values = await rootForm.validateFields();
            await dispatch(createCategory({ name: values.name, isRoot: true, parentId: undefined })).unwrap();
            message.success('Thêm danh mục gốc thành công');
            await dispatch(fetchCategories()); // reload sau khi thêm root
            setIsRootModalVisible(false);
            rootForm.resetFields();
          } catch (error: any) {
            message.error(error.message || 'Thao tác thất bại.');
          }
        }}
        onCancel={() => {
          setIsRootModalVisible(false);
          rootForm.resetFields();
        }}
        confirmLoading={loading}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form form={rootForm} layout="vertical" name="root_category_form">
          <Form.Item name="name" label="Tên danh mục gốc" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Thức ăn cho chó, Vòng cổ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm/sửa danh mục con */}
      <Modal title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="category_form">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Thức ăn cho chó, Vòng cổ..." />
          </Form.Item>
          {!editingCategory && activeRoot && (
            <>
              <Form.Item label="Danh mục gốc">
                <Input value={activeRoot.name} disabled />
              </Form.Item>
              {activeRoot.children && activeRoot.children.length > 0 && (
                <Form.Item name="parentIdLv2" label="Chọn danh mục cấp 2 (nếu muốn tạo cấp 3)">
                  <Select allowClear placeholder="Chọn danh mục cấp 2 (bỏ qua nếu muốn tạo cấp 2)">
                    {activeRoot.children.map(child => (
                      <Option key={child._id} value={child._id}>{child.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>

      {/* Modal tạo danh mục từ context menu */}
      <Modal title={contextMenu.level === 2 ? 'Tạo danh mục cấp 2' : 'Tạo danh mục cấp 3'}
        open={isContextModalVisible}
        onOk={handleContextCreate}
        onCancel={() => {
          setIsContextModalVisible(false);
          contextForm.resetFields();
        }}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={contextForm} layout="vertical">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Nhập tên danh mục..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const CategoriesPage = () => (
  <App>
    <Categories />
  </App>
);

export default CategoriesPage;
