import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="efugr7hcvqaro8t5dejjb6btwroyhd0ie5tydu5so3x3qjw4" // Replace with your TinyMCE API key
      value={value}
      onEditorChange={(content) => onChange?.(content)}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | table',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  );
};

export default TinyMCEEditor; 