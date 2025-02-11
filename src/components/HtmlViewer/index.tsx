import React from "react";
import { toast } from "react-toastify";
import { Icon } from "semantic-ui-react";

interface HtmlViewerProps {
  htmlData: string;
}

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

      <pre style={{ margin: 0 }}>{htmlData}</pre>
    </div>
  );
};

export default HtmlViewer;
