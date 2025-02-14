import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  width: 450px;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const DropArea = styled.div`
  border: 2px dashed #008080;
  padding: 30px;
  border-radius: 10px;
  background: #f9f9f9;
  cursor: pointer;
  text-align: center;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button<{ primary?: boolean }>`
  width: 48%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background: ${(props) => (props.primary ? "#008080" : "#ddd")};
  color: ${(props) => (props.primary ? "white" : "black")};
`;

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>Upload JSON</h2>
        <DropArea>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            hidden
            id="fileInput"
          />
          <label htmlFor="fileInput">
            Drag and drop JSON file or <span style={{ color: "#008080", cursor: "pointer" }}>Choose to Upload</span>
          </label>
        </DropArea>
        <ButtonContainer>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary disabled={!file} onClick={() => file && onUpload(file)}>
            Upload
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default UploadModal;
