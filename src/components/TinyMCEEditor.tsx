import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="efugr7hcvqaro8t5dejjb6btwroyhd0ie5tydu5so3x3qjw4"//test only nha cac con vo
      value={value}
      onEditorChange={(content: string) => onChange?.(content)}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | table',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        images_upload_handler: async (...args) => {
          const blobInfo = args[0]; 
          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());

          const res = await fetch('/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          return data.url;
        }
      }}

    />
  );
};

export default TinyMCEEditor; 