import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Upload,
  Select,
  Tag,
  Image,
  message,
  Popconfirm,
  Row,
  Col,
  Slider,
  Tabs,
  Typography,

} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { CheckOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchProducts, setPagination, createProduct, getDetailProduct, type Attribute, type Product, type ProductVariant, type Category,  } from '../features/product/productSlice';
import CategorySelect from '../components/CategorySelect';
import { fetchCategories as fetchAllCategoriesFromSlice, type Category as CategoryFromSlice } from '../features/category/categorySlice';
import { fetchSuppliers } from '../features/supplier/supplierSlice';
import TinyMCEEditor from '../components/TinyMCEEditor';
import ProductDetail from '../components/ProductDetail';

const { Option } = Select;
const { Title } = Typography;

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, pagination, selectedProduct } = useSelector((state: RootState) => state.product);
  const { suppliers } = useSelector((state: RootState) => state.supplier);
  const { categories: allCategories } = useSelector((state: RootState) => state.category);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  
  interface ProductFilters {
    status?: boolean | null;
    category?: string[];
    supplier?: string;
    priceRange: [number, number];
    searchText?: string;
  }

  const [filters, setFilters] = useState<ProductFilters>({
    status: undefined,
    category: undefined,
    supplier: undefined,
    priceRange: [0, 10000000],
    searchText: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [attributeValueInputs, setAttributeValueInputs] = useState<{[attrId: string]: string}>({});
  const [activeTab, setActiveTab] = useState('1');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    const fetchParams = {
      page: pagination.current,
      limit: pagination.pageSize,
    };
    
    dispatch(fetchProducts(fetchParams));
  }, [dispatch, pagination.current, pagination.pageSize]);

  useEffect(() => {
    dispatch(fetchAllCategoriesFromSlice());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleTableChange: TableProps<Product>['onChange'] = (pagination, tableFilters) => {
    if (pagination.current && pagination.pageSize) {
      dispatch(setPagination({
        current: pagination.current,
        pageSize: pagination.pageSize
      }));
    }

    const newColumnFilters: Partial<ProductFilters> = {};

    if (Array.isArray(tableFilters.isActivate)) {
        newColumnFilters.status = tableFilters.isActivate[0] as boolean | null;
    }

    if (Array.isArray(tableFilters.categories)) {
        newColumnFilters.category = tableFilters.categories.map(String);
    }

    setFilters(prev => ({ ...prev, ...newColumnFilters }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchText: value }));
    dispatch(setPagination({ current: 1 }));
  };

  const filteredProducts = products.filter(product => {
    let isMatch = true;

    // Filter by searchText (product name)
    if (filters.searchText) {
      isMatch = product.name.toLowerCase().includes(filters.searchText.toLowerCase());
    }

    // Filter by status (isActivate)
    if (isMatch && filters.status !== undefined && filters.status !== null) {
      isMatch = product.isActivate === filters.status;
    }

    // Filter by category (_id)
    if (isMatch && Array.isArray(filters.category) && filters.category.length > 0) {
      isMatch = Array.isArray(product.categories) ? product.categories.some(productCat => 
        typeof productCat._id === 'string' && filters.category?.includes(productCat._id)
      ) : false;
    }

    // Filter by supplier name
    if (isMatch && filters.supplier !== undefined) {
      console.log('Filtering by supplier:', {
        selectedSupplier: filters.supplier,
        productSupplier: product.supplier,
        isMatch: product.supplier === filters.supplier
      });
      isMatch = product.supplier === filters.supplier;
    }

    // Filter by priceRange
    if(isMatch && Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
      const [min, max] = filters.priceRange;
      const productPrice = product.maxSellingPrice;
      
      if (typeof productPrice === 'number') {
        isMatch = productPrice >= min && productPrice <= max;
      } else if (min > 0 || max < 10000000) {
        isMatch = false;
      }
    }

    return isMatch;
  });

  // Debug log for suppliers data
  useEffect(() => {
    console.log('Suppliers data:', suppliers);
  }, [suppliers]);

  // Debug log for filters
  useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);

  useEffect(() => {
    console.log('Filtered products:', filteredProducts);
  }, [filteredProducts]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleAddAttribute = () => {
    const newAttribute: Attribute = {
      id: `attr_${Date.now()}`,
      name: '',
      type: 'select',
      options: []
    };
    setAttributes([...attributes, newAttribute]);
  };

  const handleAttributeChange = (id: string, field: keyof Attribute, value: any) => {
    setAttributes(prev => prev.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ));
  };

  const handleAddAttributeValue = (attrId: string) => {
    const value = (attributeValueInputs[attrId] || '').trim();
    if (!value) return;
    setAttributes(prev => prev.map(attr =>
      attr.id === attrId && !attr.options.includes(value)
        ? { ...attr, options: [...attr.options, value] }
        : attr
    ));
    setTimeout(() => {
      setAttributeValueInputs(prev => ({ ...prev, [attrId]: '' }));
    }, 0);
  };

  const handleRemoveAttributeValue = (attrId: string, value: string) => {
    setAttributes(prev => prev.map(attr =>
      attr.id === attrId
        ? { ...attr, options: attr.options.filter(opt => opt !== value) }
        : attr
    ));
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  const renderAttributeFields = () => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Button type="dashed" onClick={handleAddAttribute} icon={<PlusOutlined />}>Thêm thuộc tính</Button>
        </div>
      </div>
      {attributes.map((attr) => (
        <Card key={attr.id} style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={5}>
              <Input
                placeholder="Tên thuộc tính (ví dụ: Size, Màu sắc)"
                value={attr.name}
                onChange={e => handleAttributeChange(attr.id, 'name', e.target.value)}
              />
            </Col>
            <Col span={16}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {attr.options.map(option => (
                  <Tag
                    key={option}
                    closable
                    onClose={() => handleRemoveAttributeValue(attr.id, option)}
                    style={{ padding: '4px 12px', fontSize: 16, marginBottom: 4 }}
                  >
                    {option}
                  </Tag>
                ))}
                <Input
                  style={{ width: 120 }}
                  size="small"
                  placeholder="Nhập giá trị"
                  value={attributeValueInputs[attr.id] || ''}
                  onChange={e => setAttributeValueInputs(prev => ({ ...prev, [attr.id]: e.target.value }))}
                  onPressEnter={() => handleAddAttributeValue(attr.id)}
                />
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => handleAddAttributeValue(attr.id)}
                  style={{ marginLeft: 4 }}
                  disabled={!(attributeValueInputs[attr.id] && attributeValueInputs[attr.id].trim())}
                >
                  <CheckOutlined />
                </Button>
              </div>
            </Col>
            <Col span={2}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveAttribute(attr.id)}
              />
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );

  const columns: TableProps<Product>['columns'] = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) => (
        <Image
          src={images[0] || 'https://via.placeholder.com/50'}
          alt="Product"
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: Category[]) => categories.map(cat => cat.name).join(', '),
      filters: allCategories.map((cat: CategoryFromSlice) => ({
          text: cat.name,
          value: cat._id,
      })),      
      onFilter: (value, record) => {
        if (!Array.isArray(record.categories)) {
            return false;
        }

        if (Array.isArray(value)) {
             return record.categories.some(cat => typeof cat._id === 'string' && value.includes(cat._id));
        }

        if (typeof value === 'string') {
             return record.categories.some(cat => typeof cat._id === 'string' && cat._id === value);
        }

        return false;
      },
    },
    {
      title: 'Giá bán',
      dataIndex: 'maxSellingPrice',
      key: 'maxSellingPrice',
      render: (price: number | undefined) => price ? `${price.toLocaleString('vi-VN')} VNĐ` : '-',
      sorter: (a, b) => (a.maxSellingPrice || 0) - (b.maxSellingPrice || 0),
    },
    {
      title: 'Giá khuyến mãi',
      dataIndex: 'maxPromotionalPrice',
      key: 'maxPromotionalPrice',
      render: (price: number | undefined) => price ? `${price.toLocaleString('vi-VN')} VNĐ` : '-',
      sorter: (a, b) => (a.maxPromotionalPrice || 0) - (b.maxPromotionalPrice || 0),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'sumStock',
      key: 'sumStock',
      sorter: (a, b) => a.sumStock - b.sumStock,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActivate',
      key: 'isActivate',
      render: (isActivate: boolean) => (
        <Tag color={isActivate ? 'success' : 'default'}>
          {isActivate ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
      filters: [
        { text: 'Đang bán', value: true },
        { text: 'Ngừng bán', value: false },
      ],
      onFilter: (value, record) => record.isActivate === value,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Implement delete logic here
      message.success('Xóa sản phẩm thành công');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
  
      const variantsArr = Array.isArray(values.variants)
        ? values.variants
        : Object.values(values.variants || {});
  
      let mappedVariants: any[] = [];
      if (attributes.length === 0) {
        if (variantsArr.length > 0) {
          const v = variantsArr[0];
          mappedVariants = [{
            stock: v.stock || 0,
            unitValues: [],
            importPrice: v.importPrice || 0,
            sellingPrice: v.sellingPrice || v.price || 0,
            promotionalPrice: v.promotionalPrice || 0,
          }];
        } else {
          mappedVariants = [];
        }
      } else {
        mappedVariants = variantsArr.map((variant: any) => ({
          stock: variant.stock,
          unitValues: Object.values(variant.attributes || {}),
          importPrice: variant.importPrice,
          sellingPrice: variant.sellingPrice || variant.price,
          promotionalPrice: variant.promotionalPrice,
        }));
      }
  
      const payload = {
        isActivate: values.status === 'active',
        categories: [values.categoryId],
        suppliers_id: values.supplier,
        descriptions: values.descriptions,
        name: values.name,
        variantGroups: attributes.map(attr => ({
          groupName: attr.name,
          units: attr.options.map(opt => ({ unitName: opt }))
        })),
        variants: mappedVariants
      };
  
      formData.append('data', JSON.stringify(payload));
  
      // Append images
      if (values.images) {
        values.images.forEach((file: any) => {
          formData.append('images', file.originFileObj);
        });
      }
  
      await dispatch(createProduct(formData));
      message.success('Thêm sản phẩm thành công!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm sản phẩm!');
    }
  };
  

  // Hàm sinh tổ hợp các giá trị thuộc tính (Cartesian product)
  function cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);
  }

  // useEffect sinh variants
  useEffect(() => {
    // Nếu chưa có thuộc tính nào, luôn có 1 variant mặc định
    if (!attributes.length) {
      const defaultVariants = [{
        id: 'default',
        attributes: {},
        stock: 0,
        sku: '',
        sellingPrice: 0,
        importPrice: 0,
        promotionalPrice: 0,
      }];
      setVariants(defaultVariants);
      form.setFieldsValue({ variants: defaultVariants });
      return;
    }

    // Nếu có thuộc tính mà có cái chưa có giá trị, giữ nguyên variants cũ
    if (attributes.some(attr => attr.options.length === 0)) {
      // KHÔNG setVariants, KHÔNG setFieldsValue => giữ nguyên bảng cũ
      return;
    }

    // Sinh variants như cũ
    const allOptions = attributes.map(attr => attr.options);
    const combos = cartesianProduct(allOptions);    
    const newVariants: ProductVariant[] = combos.map((combo, idx) => {
      const attrObj: { [key: string]: string } = {};
      attributes.forEach((attr, i) => {
        attrObj[attr.name] = combo[i];
      });
      return {
        id: `variant_${combo.join('_')}_${idx}`,
        attributes: attrObj,
        stock: 0,
        sku: '',
        sellingPrice: 0,
        importPrice: 0,
        promotionalPrice: 0,
      };
    });
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  }, [attributes]);

  const handleRemoveVariant = (variantId: string) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const getVariantColumns = () => {
    const baseColumns = attributes.map(attr => ({
      title: attr.name,
      dataIndex: ['attributes', attr.name],
      key: attr.name,
      width: 120,
      render: (value: string | string[]) => {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      }
    }));

    return [
      ...baseColumns,
      {
        title: 'Giá nhập',
        key: 'importPrice',
        width: 100,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'importPrice']}
            rules={[{ required: true, message: 'Nhập giá nhập' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Giá nhập"
              min={0}
              style={{ width: '100%' }}
              size="small"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        ),
      },
      {
        title: 'Giá bán',
        key: 'price',
        width: 100,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'price']}
            rules={[{ required: true, message: 'Nhập giá' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Giá bán"
              min={0}
              style={{ width: '100%' }}
              size="small"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        ),
      },
      {
        title: 'Số lượng nhập',
        key: 'importQuantity',
        width: 100,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'importQuantity']}
            rules={[{ required: true, message: 'Nhập số lượng' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Số lượng nhập"
              min={0}
              style={{ width: '100%' }}
              size="small"
            />
          </Form.Item>
        ),
      },
      {
        title: 'Tồn kho',
        key: 'stock',
        width: 80,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'stock']}
            rules={[{ required: true, message: 'Nhập tồn kho' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Tồn kho"
              min={0}
              style={{ width: '100%' }}
              size="small"
            />
          </Form.Item>
        ),
      },
      {
        title: 'Hình ảnh',
        key: 'image',
        width: 80,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'image']}
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
            style={{ marginBottom: 0 }}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              style={{ width: '100%' }}
            >
              <Button icon={<UploadOutlined />} style={{ width: '100%' }} size="small">Ảnh</Button>
            </Upload>
          </Form.Item>
        ),
      },
      {
        title: 'Giá khuyến mãi',
        key: 'promotionalPrice',
        width: 100,
        render: (_: unknown, record: ProductVariant, index: number) => (
          <Form.Item
            name={['variants', index.toString(), 'promotionalPrice']}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Giá khuyến mãi"
              min={0}
              style={{ width: '100%' }}
              size="small"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        ),
      },
      {
        title: '',
        key: 'action',
        width: 40,
        render: (_: unknown, record: ProductVariant) => (
          <Button
            type="text"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => handleRemoveVariant(record.id)}
          />
        ),
      },
    ];
  };

  const handleViewDetails = async (product: Product) => {
    try {
      const result = await dispatch(getDetailProduct(product._id)).unwrap();
      console.log('Product Detail Response:', result);
      if (result) {
        setIsDetailModalVisible(true);
      } else {
        message.error('Không thể lấy thông tin chi tiết sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      message.error('Có lỗi xảy ra khi lấy thông tin chi tiết sản phẩm');
    }
  };

  const handleCloseDetail = () => {
    setIsDetailModalVisible(false);
    dispatch({ type: 'product/resetProductState' });
  };

  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      category: undefined,
      supplier: undefined,
      priceRange: [0, 10000000],
      searchText: '',
    });
  };

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>Quản lý sản phẩm</Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm sản phẩm"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
                value={filters.searchText}
              />
              <Button icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}>
                Bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null);
                  form.resetFields();
                  setAttributes([]);
                  setVariants([]);
                  setActiveTab('1');
                  setIsModalVisible(true);
                }}
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>

        {showFilters && (
          <Card style={{ marginBottom: 16 }}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Trạng thái">
                    <Select
                      placeholder="Chọn trạng thái"
                      allowClear
                      value={filters.status}
                      onChange={(value: boolean | null | undefined) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <Option value={true}>Đang bán</Option>
                      <Option value={false}>Ngừng bán</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Danh mục">
                    <Select
                      placeholder="Chọn danh mục"
                      allowClear
                      value={filters.category}
                      onChange={(value: string[] | undefined) => setFilters(prev => ({ ...prev, category: value }))}
                      mode="multiple"
                    >
                       {allCategories.map((cat: CategoryFromSlice) => (
                         <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                       ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Nhà cung cấp">
                    <Select
                      placeholder="Chọn nhà cung cấp"
                      allowClear
                      value={filters.supplier}
                      onChange={(value: string | undefined) => setFilters(prev => ({ ...prev, supplier: value }))}
                    >
                       {suppliers.map((supplier) => (
                         <Option key={supplier._id} value={supplier.name}>{supplier.name}</Option>
                       ))}
                    </Select>
                  </Form.Item>
                </Col>
                 <Col span={6}>
                  <Form.Item label="Khoảng giá">
                    <Slider
                      range
                      min={0}
                      max={10000000}
                      step={100000}
                      value={filters.priceRange}
                      onChange={(value: [number, number]) => {
                         // Ensure value is a tuple [number, number]
                        if(Array.isArray(value) && value.length === 2) {
                            setFilters(prev => ({ ...prev, priceRange: value }));
                        }
                    }}
                      tipFormatter={(value) => `${value?.toLocaleString('vi-VN')} VNĐ`}
                    />
                  </Form.Item>
                </Col>
              </Row>
               <Row justify="end" style={{ marginTop: 16 }}>
                  <Col>
                       <Button onClick={handleResetFilters}>
                           Đặt lại bộ lọc
                       </Button>
                  </Col>
               </Row>
            </Form>
          </Card>
        )}
      </Card>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={loading}
        bordered
        onChange={handleTableChange}
        style={{ backgroundColor: '#f0f2f5' }}
        className="custom-table"
        pagination={pagination}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={() => {
          form.validateFields().then(onFinish);
        }}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
          setSelectedCategory('');
          setAttributes([]);
          setVariants([]);
          setAttributeValueInputs({});
          setActiveTab('1');
        }}
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
                    <CategorySelect onChange={handleCategoryChange} value={selectedCategory} />
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
                        <Option key={supplier._id} value={supplier._id}>{supplier.name}</Option>
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
                <Table<ProductVariant>
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

      <ProductDetail
        isVisible={isDetailModalVisible}
        onClose={handleCloseDetail}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products; 