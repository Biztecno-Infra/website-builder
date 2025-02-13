import React from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

interface HtmlViewerProps {
  htmlData: string;
}

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
  padding: 16px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  border: 1px solid #ddd;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreContent = styled.pre`
  margin: 0;
`;

const HtmlViewer: React.FC<HtmlViewerProps> = ({ htmlData }) => {
  const copyToClipboard = async (text: any) => {
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("HTML Copied!");
      } catch (error) {
        toast.error("Failed to copy HTML.");
        console.error("Error copying HTML:", error);
      }
    } else {
      // Fallback for unsupported browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("HTML Copied!");
      } catch (error) {
        toast.error("Failed to copy HTML.");
        console.error("Error copying HTML:", error);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCopy = () => {
    copyToClipboard(htmlData);
  };

  return (
    <ViewerContainer>
      <CopyButton onClick={handleCopy}>
        Copy
        {/* <Icon name="copy" size="large" /> */}
      </CopyButton>

      <PreContent>{htmlData}</PreContent>
    </ViewerContainer>
  );
};

export default HtmlViewer;
