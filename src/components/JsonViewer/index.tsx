import React from "react";
import { toast } from "react-toastify"; 
import { Icon } from "semantic-ui-react"; 

interface JSONDisplayProps {
  jsonData: any; 
}

const JsonViewer: React.FC<JSONDisplayProps> = ({ jsonData }) => {
  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2); 
  };

  //Fix for now 
const copyToClipboard = async (text:any) => {
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
    copyToClipboard(jsonString)
  };

  return (
    <div
      style={{
        position: "relative", 
        width: "100%",
        height: "100%",
        backgroundColor: "#f4f4f4",
        padding: "16px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap", 
        overflowX: "auto", 
        border: "1px solid #ddd",
      }}
    >
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1.2rem",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="copy" size="large" /> 
      </button>

      <pre style={{ margin: 0 }}>{formatJSON(jsonData)}</pre>
    </div>
  );
};

export default JsonViewer;
