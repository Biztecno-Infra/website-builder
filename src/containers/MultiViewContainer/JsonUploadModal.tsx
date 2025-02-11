import React, { useState } from "react";
import { Modal, Button, TextArea, Icon } from "semantic-ui-react";

// This will be the modal to handle pasting or uploading JSON.
const JsonUploadModal: React.FC<{ onJsonUpload: (jsonData: any) => void , onClose:() => void }> = ({ onJsonUpload , onClose }) => {
  const [jsonInput, setJsonInput] = useState(""); // Store the pasted JSON here

  // Handle the upload button click
  const handleUpload = () => {
    try {
      const parsedJson = JSON.parse(jsonInput); // Parse the JSON input
      onJsonUpload(parsedJson); // Pass parsed JSON to parent to update the blocks
    } catch (error) {
      alert("Invalid JSON format.");
    }
  };

  return (
    <Modal open={true} onClose={onClose} closeOnDimmerClick={true} closeIcon>
      <Modal.Header>Upload JSON</Modal.Header>
      <Modal.Content>
        <TextArea
          placeholder="Paste your JSON here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          style={{ minHeight: 200 , width:"100%" }}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setJsonInput("")}>Clear</Button>
        <Button onClick={handleUpload} primary>
          Upload
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default JsonUploadModal;
