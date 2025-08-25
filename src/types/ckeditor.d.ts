declare module '@ckeditor/ckeditor5-react' {
  import React from 'react';
  
  interface CKEditorProps {
    editor: any;
    data?: string;
    config?: any;
    onReady?: (editor: any) => void;
    onChange?: (event: any, editor: any) => void;
    onBlur?: (event: any, editor: any) => void;
    onFocus?: (event: any, editor: any) => void;
  }
  
  export const CKEditor: React.FC<CKEditorProps>;
}

declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export default ClassicEditor;
}
