import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

type Props = {
  formData: { text: string };
  handleChange: (name: string, value: string) => void;
};

const EditorWrapper = styled.div`
  .ql-editor {
    min-height: 150px;
    font-size: 14px;
  }
`;

const RichTextEditor = ({ formData, handleChange }: Props) => {
  return (
    <EditorWrapper>
      <label htmlFor="content">Content</label>
      <ReactQuill
        theme="snow"
        value={formData.text}
        onChange={(val) => handleChange('text', val)}
        placeholder="Enter content..."
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        }}
        formats={[
          'bold',
          'italic',
          'underline',
          'list',
          'bullet',
        ]}
      />
    </EditorWrapper>
  );
};

export default RichTextEditor;
