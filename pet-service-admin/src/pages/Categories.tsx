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
import { fetchCategories, createCategory, updateCategory, type Category, CategoryType } from '../features/category/categorySlice';
import './Categories.css';

const { Title } = Typography;
const { Option } = Select;

const Categories: React.FC = () => {
  const { message } = App.useApp();
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

  // --- Hàm xây dựng cây danh mục ---
  const buildCategoryTree = (flatList: Category[]): Category[] => {
    const map: { [key: string]: Category & { children?: Category[] } } = {};

    // Bước 1: Khởi tạo map và thêm các thuộc tính cần thiết
    flatList.forEach(category => {
      map[category._id] = { ...category };
      map[category._id].children = [];
    });

    const rootNodes: Category[] = [];

    // Bước 2: Xây dựng cây
    flatList.forEach(category => {
      if (category.parentId && map[category.parentId]) {
        map[category.parentId].children?.push(map[category._id]);
      } else {
        rootNodes.push(map[category._id]);
      }
    });

    // Bước 3: Dọn dẹp mảng children rỗng và sắp xếp
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
        // Cập nhật text ngay lập tức khi nhấn OK
        const updatedCategories = categories.map(cat =>
          cat._id === editingCategory._id
            ? { ...cat, name: values.name }
            : cat
        );
        
        // Cập nhật state và UI ngay lập tức
        dispatch({ type: 'category/fetchCategoriesSuccess', payload: updatedCategories });
        
        // Đóng modal và reset form
        setIsModalVisible(false);
        form.resetFields();
        setEditingCategory(null);

        // Gọi API cập nhật (online)
        try {
          const result = await dispatch(updateCategory({
            id: editingCategory._id,
            name: values.name,
          })).unwrap();

          if (!result.success) {
            // Nếu API thất bại, rollback lại state cũ
            dispatch({ type: 'category/fetchCategoriesSuccess', payload: categories });
            message.error(result.errors?.[0] || 'Có lỗi xảy ra');
          } else {
            message.success('Cập nhật danh mục thành công');
            // Load lại dữ liệu sau khi cập nhật thành công
            dispatch(fetchCategories());
          }
        } catch (error) {
          // Nếu có lỗi API, rollback lại state cũ
          dispatch({ type: 'category/fetchCategoriesSuccess', payload: categories });
          message.error('Có lỗi xảy ra khi cập nhật');
        }
      } else {
        // Tạo mới danh mục
        const categoryData = {
          name: values.name,
          isRoot: values.isRoot,
          parentId: values.isRoot ? undefined : values.parentId,
          ...(values.isRoot && { categoryType: values.categoryType }) // chỉ thêm categoryType nếu là danh mục gốc
        };
                
        // Tạo ID tạm thời
        const tempId = 'temp_' + Date.now();
        
        // Thêm category mới vào UI ngay lập tức
        const newCategory = {
          _id: tempId,
          name: values.name,
          isRoot: values.isRoot,
          parentId: values.parentId,
          categoryType: values.categoryType,
          children: [],
        };

        // Cập nhật state và UI ngay lập tức
        dispatch({ type: 'category/fetchCategoriesSuccess', payload: [...categories, newCategory] });
        
        // Đóng modal và reset form
        setIsModalVisible(false);
        form.resetFields();
        setEditingCategory(null);

        // Gọi API tạo mới (online)
        try {
          const result = await dispatch(createCategory(categoryData)).unwrap();

          if (!result.success) {
            // Nếu API thất bại, rollback lại state cũ
            dispatch({ type: 'category/fetchCategoriesSuccess', payload: categories });
            if (result.errors?.[0]?.includes('already exists')) {
              message.error('Tên danh mục đã tồn tại. Vui lòng chọn tên khác.');
            } else {
              message.error(result.errors?.[0] || 'Có lỗi xảy ra khi thêm danh mục.');
            }
          } else {
            message.success('Thêm danh mục thành công');
            // Load lại dữ liệu sau khi thêm mới thành công
            dispatch(fetchCategories());
          }
        } catch (error) {
          // Nếu có lỗi API, rollback lại state cũ
          dispatch({ type: 'category/fetchCategoriesSuccess', payload: categories });
          message.error('Có lỗi xảy ra khi thêm mới');
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        console.log('Validation failed:', error.errorFields);
      } else {
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
      message.success('Xóa danh mục thành công');
      dispatch(fetchCategories());
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

  // Xây dựng nguồn dữ liệu phân cấp cho bảng
  const hierarchicalCategories = buildCategoryTree(categories);

  // Xử lý click vào hàng để mở rộng/thu gọn
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

  // Logic lọc danh mục cho tìm kiếm (áp dụng cho cấp cao nhất để đơn giản)
  const displayedCategories = hierarchicalCategories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>Quản lý danh mục</Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm danh mục"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCategory(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
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
          style={{ backgroundColor: '#f0f2f5' }}
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
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          {!editingCategory && (
            <>
              <Divider orientation="left">Cấu hình danh mục</Divider>

              <Form.Item
                name="isRoot"
                label="Loại danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn loại danh mục' }]}
              >
                <Select placeholder="Chọn loại danh mục">
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
                    >
                      <Select placeholder="Chọn loại thú cưng">
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
                    >
                      <Select placeholder="Chọn danh mục cha">
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