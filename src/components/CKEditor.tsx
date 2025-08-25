import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const CKEditorComponent: React.FC<CKEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={{
          placeholder: placeholder || 'Nhập nội dung bài viết...',
          language: 'vi',
          height: '400px',
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo'
          ]
        }}
        onReady={(editor: any) => {
          console.log('CKEditor is ready to use!', editor);
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange?.(data);
        }}
        onBlur={(event: any, editor: any) => {
          console.log('Blur.', editor);
        }}
        onFocus={(event: any, editor: any) => {
          console.log('Focus.', editor);
        }}
      />
    </div>
  );
};

export default CKEditorComponent;
