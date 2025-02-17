import React, { useState } from "react";
import styled from "styled-components";
import ModalOverlay from "@components/lib/ModalOverlay";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { SizeEnum } from "@components/SvgIcon/SvgIcon";

const DropArea = styled.div`
  border: 2px dashed #0B978E;
  height: 12rem;
  border-radius: 10px;
  background: #F5F5F5;
  cursor: pointer;
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;

`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #DDDDDD;
  padding-top: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  width: 48%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background: ${(props) => (props.primary ? "#0B978E" : "#ddd")};
  color: ${(props) => (props.primary ? "white" : "black")};
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
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
    <ModalOverlay onClose={onClose}>
      <Title>Upload JSON</Title>
      <DropArea>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          hidden
          id="fileInput"
        />
        <SvgIcon name={CUSTOM_SVG_ICON.UploadIcon} size={SizeEnum.Medium}/>
        <label htmlFor="fileInput">
          Drag and drop JSON file or{" "}
          <span style={{ color: "#0B978E", cursor: "pointer" }}>
            Choose to Upload
          </span>
        </label>
      </DropArea>
      <ButtonContainer>
        <Button onClick={onClose}>Cancel</Button>
        <Button primary disabled={!file} onClick={() => file && onUpload(file)}>
          Upload
        </Button>
      </ButtonContainer>
    </ModalOverlay>
  );
};

export default UploadModal;
