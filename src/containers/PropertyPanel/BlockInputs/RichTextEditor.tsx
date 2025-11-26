import React, { useEffect, useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
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
  const [content, setContent] = useState(textContent ?? "");
  const quillRef = useRef<ReactQuill | null>(null);
  const isSettingContent = useRef(false);

  /** Sync external value */
  useEffect(() => {
    if (textContent !== content) {
      isSettingContent.current = true;
      setContent(textContent ?? "");
    }
  }, [textContent]);

  /** Controlled change handler */
  const onChange = (val: string) => {
    setContent(val);
    if (isSettingContent.current) {
      isSettingContent.current = false;
      return;
    }
    handleChange("text", val);
  };


  /** 🟩 ADDING CLIPBOARD MATCHER TO STRIP ALL FORMATTING RELIABLY */
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    // Use Quill's internal Delta for reliable content handling
    const Delta = Quill.import('delta');

    // Add a matcher that intercepts paste events and forces plain text
    editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      // Map over all operations in the paste Delta and remove attributes (formatting)
      const ops = delta?.ops?.map((op) => ({ insert: op.insert }));
      return new Delta(ops);
    });
  }, []); 
  /** Editor toolbar config */
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
    clipboard: {
      // Keep matchVisual false to prevent other truncation issues
      matchVisual: false, 
      // We are managing matchers via useEffect now, so we can leave this empty
      // or remove it. The useEffect hook takes precedence.
    },
  };


  return (
    <EditorWrapper>
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
