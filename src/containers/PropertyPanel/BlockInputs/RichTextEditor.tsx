import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

type Props = {
  textContent: string ;
  handleChange: (name: string, value: string) => void;
};

const EditorWrapper = styled.div`
  .ql-editor {
    min-height: 150px;
    font-size: 14px;
  }

  .quill {
    border: 4px solid #f1f1f1;
    border-radius: 5px;
  }

  .ql-toolbar.ql-snow {
    border: none;
    border-bottom: 2px solid #f1f1f1;
  }

  .ql-container.ql-snow {
    border: none;
  }
`;

const RichTextEditor = ({ textContent, handleChange }: Props) => {
  return (
    <EditorWrapper>
      <ReactQuill
        theme="snow"
        value={textContent}
        onChange={(val) => handleChange("text", val)}
        placeholder="Enter content..."
        modules={{
          toolbar: [
            ["bold", "italic", "underline"],
            [{ color: [] }, { background: [] }], 
            ["clean"],
          ],
        }}
        formats={[
          "bold",
          "italic",
          "underline",
          "color",
          "background",
        ]}
      />
    </EditorWrapper>
  );
};

export default RichTextEditor;
