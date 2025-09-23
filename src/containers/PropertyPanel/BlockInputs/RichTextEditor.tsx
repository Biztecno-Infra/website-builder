import React, { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";

type Props = {
  textContent: string;
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
  const [content, setContent] = useState(textContent);
  const isSettingContent = useRef(false);

  // Sync prop changes to internal state, but avoid triggering handleChange
  useEffect(() => {
    if (textContent !== content) {
      isSettingContent.current = true;
      setContent(textContent);
    }
  }, [textContent]);

  const onChange = (val: string) => {
    setContent(val);
    // If content update caused by prop sync, skip calling handleChange
    if (isSettingContent.current) {
      isSettingContent.current = false;
      return;
    }
    handleChange("text", val);
  };

  return (
    <EditorWrapper>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        placeholder="Enter content..."
        modules={{
          toolbar: [["bold", "italic", "underline"], [{ color: [] }, { background: [] }], ["clean"]],
        }}
        formats={["bold", "italic", "underline", "color", "background"]}
      />
    </EditorWrapper>
  );
};

export default RichTextEditor;
