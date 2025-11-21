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

  /** 🟩 PURE PLAIN TEXT PASTE — NO HTML, NO FORMATTING */
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const root = editor.root;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text) return;

      const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };

      // Insert clean text
      editor.insertText(range.index, text);

      // Move cursor to the end
      editor.setSelection({
        index: range.index + text.length,
        length: 0,
      });
    };

    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("paste", handlePaste);
    };
  }, []);

  /** Editor toolbar config */
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
      matchers: [], // Prevent Quill from injecting formatting
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
