import React from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

interface JSONDisplayProps {
  jsonData: any;
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

const JsonViewer: React.FC<JSONDisplayProps> = ({ jsonData }) => {
  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const copyToClipboard = async (text: any) => {
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("JSON Copied!");
      } catch (error) {
        toast.error("Failed to copy JSON.");
        console.error("Error copying JSON:", error);
      }
    } else {
      // Fallback for unsupported browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("JSON Copied!");
      } catch (error) {
        toast.error("Failed to copy JSON.");
        console.error("Error copying JSON:", error);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCopy = () => {
    const jsonString = formatJSON(jsonData);
    copyToClipboard(jsonString);
  };

  return (
    <ViewerContainer>
      <CopyButton onClick={handleCopy}>
        copy
        {/* <Icon name="copy" size="large" /> */}
      </CopyButton>

      <PreContent>{formatJSON(jsonData)}</PreContent>
    </ViewerContainer>
  );
};

export default JsonViewer;
