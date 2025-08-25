import React, { useEffect, useState } from 'react';
import { Select, Space, message } from 'antd';
import { getChildCategories } from '../api/category.api';

const { Option } = Select;

interface CategorySelectProps {
  onChange: (categoryId: string) => void;
  value?: string;
  allowAnyLevel?: boolean; // Thêm prop để cho phép chọn ở bất kỳ cấp nào
}

const CategorySelect: React.FC<CategorySelectProps> = ({ onChange, value, allowAnyLevel = false }) => {
  const [lv1Categories, setLv1Categories] = useState<any[]>([]);
  const [lv2Categories, setLv2Categories] = useState<any[]>([]);
  const [lv3Categories, setLv3Categories] = useState<any[]>([]);
  const [selectedLv1, setSelectedLv1] = useState<string | undefined>();
  const [selectedLv2, setSelectedLv2] = useState<string | undefined>();
  const [selectedLv3, setSelectedLv3] = useState<string | undefined>();

  // Lấy danh mục gốc (lv1) khi mount
  useEffect(() => {
    getChildCategories('null').then(res => {
      console.log('Lv1 API trả về:', res.data);
      setLv1Categories(res.data || []);
    });
  }, []);

  // Xử lý khi value thay đổi từ bên ngoài (ví dụ khi edit sản phẩm)
  useEffect(() => {
    if (value) {
      // Tìm category trong danh sách để xác định level
      const findCategoryLevel = async () => {
        // Kiểm tra trong lv1
        const lv1Cat = lv1Categories.find((cat: any) => cat._id === value);
        if (lv1Cat) {
          setSelectedLv1(value);
          setSelectedLv2(undefined);
          setSelectedLv3(undefined);
          setLv2Categories([]);
          setLv3Categories([]);
          return;
        }

        // Kiểm tra trong lv2
        for (const lv1Cat of lv1Categories) {
          const lv2Res = await getChildCategories(lv1Cat._id);
          const lv2Cats = lv2Res.data || [];
          const lv2Cat = lv2Cats.find((cat: any) => cat._id === value);
          if (lv2Cat) {
            setSelectedLv1(lv1Cat._id);
            setSelectedLv2(value);
            setSelectedLv3(undefined);
            setLv2Categories(lv2Cats);
            setLv3Categories([]);
            return;
          }

          // Kiểm tra trong lv3
          for (const lv2Cat of lv2Cats) {
            const lv3Res = await getChildCategories(lv2Cat._id);
            const lv3Cats = lv3Res.data || [];
            const lv3Cat = lv3Cats.find((cat: any) => cat._id === value);
            if (lv3Cat) {
              setSelectedLv1(lv1Cat._id);
              setSelectedLv2(lv2Cat._id);
              setSelectedLv3(value);
              setLv2Categories(lv2Cats);
              setLv3Categories(lv3Cats);
              return;
            }
          }
        }
      };

      findCategoryLevel();
    }
  }, [value, lv1Categories]);

  // Khi chọn lv1, lấy lv2
  const handleLv1Change = async (categoryId: string) => {
    setSelectedLv1(categoryId);
    setSelectedLv2(undefined);
    setSelectedLv3(undefined);
    setLv3Categories([]);
    
    // Nếu cho phép chọn ở bất kỳ cấp nào, có thể chọn lv1
    if (allowAnyLevel) {
      onChange(categoryId);
    } else {
      onChange('');
    }
    
    const res = await getChildCategories(categoryId);
    console.log('Chọn Lv1:', categoryId, 'API trả về Lv2:', res.data);
    const lv2 = res.data || [];
    setLv2Categories(lv2);
    
    // Nếu không cho phép chọn ở bất kỳ cấp nào và không có lv2, báo lỗi
    if (!allowAnyLevel && lv2.length === 0) {
      message.error('Danh mục này chưa có cấp 2, vui lòng tạo danh mục con trước!');
      setSelectedLv1(undefined);
      setLv2Categories([]);
    }
  };

  // Khi chọn lv2, lấy lv3
  const handleLv2Change = async (categoryId: string) => {
    setSelectedLv2(categoryId);
    setSelectedLv3(undefined);
    
    // Nếu cho phép chọn ở bất kỳ cấp nào, có thể chọn lv2
    if (allowAnyLevel) {
      onChange(categoryId);
    } else {
      onChange('');
    }
    
    const res = await getChildCategories(categoryId);
    console.log('Chọn Lv2:', categoryId, 'API trả về Lv3:', res.data);
    const lv3 = res.data || [];
    setLv3Categories(lv3);
    
    // Nếu không cho phép chọn ở bất kỳ cấp nào và không có lv3, báo lỗi
    if (!allowAnyLevel && lv3.length === 0) {
      message.error('Danh mục này chưa có cấp 3, vui lòng tạo danh mục con trước!');
      setSelectedLv2(undefined);
      setLv3Categories([]);
    }
  };

  const handleLv3Change = (categoryId: string) => {
    setSelectedLv3(categoryId);
    onChange(categoryId);
  };

  // Xử lý khi clear selection
  const handleClear = () => {
    setSelectedLv1(undefined);
    setSelectedLv2(undefined);
    setSelectedLv3(undefined);
    setLv2Categories([]);
    setLv3Categories([]);
    onChange('');
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        placeholder="Chọn danh mục cấp 1"
        style={{ width: '100%' }}
        onChange={handleLv1Change}
        value={selectedLv1}
        allowClear
        onClear={handleClear}
      >
        {lv1Categories.map((category: any) => (
          <Option key={category._id} value={category._id}>
            {category.name}
          </Option>
        ))}
      </Select>

      {selectedLv1 && (
        <Select
          placeholder="Chọn danh mục cấp 2"
          style={{ width: '100%' }}
          onChange={handleLv2Change}
          value={selectedLv2}
          allowClear
          onClear={handleClear}
        >
          {lv2Categories.map((category: any) => (
            <Option key={category._id} value={category._id}>
              {category.name}
            </Option>
          ))}
        </Select>
      )}

      {selectedLv2 && (
        <Select
          placeholder="Chọn danh mục cấp 3"
          style={{ width: '100%' }}
          onChange={handleLv3Change}
          value={selectedLv3}
          allowClear
          onClear={handleClear}
        >
          {lv3Categories.map((category: any) => (
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