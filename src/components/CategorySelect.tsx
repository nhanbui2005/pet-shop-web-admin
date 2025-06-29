import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Space } from 'antd';
import type { Category } from '../api/category.api';
import { fetchCategories } from '../features/category/categorySlice';

const { Option } = Select;

export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  OTHER = 'OTHER'
}

interface CategorySelectProps {
  onChange: (categoryId: string) => void;
  value?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ onChange, value }) => {
  const dispatch = useDispatch();
  const categories = useSelector((state: any) => state.category.categories);
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [selectedRootCategory, setSelectedRootCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter root categories by selected type
  const rootCategories = categories.filter(
    (cat: Category) => cat.isRoot && cat.categoryType === selectedType
  );

  // Find selected root category's children
  const childCategories = selectedRootCategory
    ? categories.filter((cat: Category) => cat.parentId === selectedRootCategory)
    : [];

  const handleTypeChange = (type: PetType) => {
    setSelectedType(type);
    setSelectedRootCategory(null);
    onChange('');
  };

  const handleRootCategoryChange = (categoryId: string) => {
    setSelectedRootCategory(categoryId);
    onChange(categoryId);
  };

  const handleChildCategoryChange = (categoryId: string) => {
    onChange(categoryId);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        placeholder="Chọn loại thú cưng"
        style={{ width: '100%' }}
        onChange={handleTypeChange}
        value={selectedType}
      >
        <Option value={PetType.DOG}>Chó</Option>
        <Option value={PetType.CAT}>Mèo</Option>
        <Option value={PetType.OTHER}>Khác</Option>
      </Select>

      {selectedType && (
        <Select
          placeholder="Chọn danh mục"
          style={{ width: '100%' }}
          onChange={handleRootCategoryChange}
          value={selectedRootCategory}
        >
          {rootCategories.map((category: Category) => (
            <Option key={category._id} value={category._id}>
              {category.name}
            </Option>
          ))}
        </Select>
      )}

      {selectedRootCategory && childCategories.length > 0 && (
        <Select
          placeholder="Chọn danh mục con"
          style={{ width: '100%' }}
          onChange={handleChildCategoryChange}
          value={value}
        >
          {childCategories.map((category: Category) => (
            <Option key={category._id} value={category._id}>
              {category.name}
            </Option>
          ))}
        </Select>
      )}
    </Space>
  );
};

export default CategorySelect; 