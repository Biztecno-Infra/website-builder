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
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (textContent !== content) {
      isSettingContent.current = true;
      setContent(textContent);
    }
  }, [textContent]);

  const onChange = (val: string) => {
    setContent(val);
    if (isSettingContent.current) {
      isSettingContent.current = false;
      return;
    }
    handleChange("text", val);
  };

  // Simple approach - always paste as plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get only plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert plain text at cursor position
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, text);
      } else {
        quill.setText(text);
      }
    }
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"], 
      [{ color: [] }, { background: [] }], 
      ["clean"]
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  return (
    <EditorWrapper onPaste={handlePaste}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        placeholder="Enter content..."
        modules={modules}
        formats={["bold", "italic", "underline", "color", "background"]}
      />
    </EditorWrapper>
  );
};

export default RichTextEditor;