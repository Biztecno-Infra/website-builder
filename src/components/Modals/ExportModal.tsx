import React, { useState } from "react";
import styled from "styled-components";

// Styled Components
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
  width: 400px;
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

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: gray;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const Option = styled.label<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => (props.selected ? "#007f7f" : "black")};

  img {
    width: 40px;
    height: 40px;
    margin-bottom: 5px;
  }

  input {
    display: none;
  }
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

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Modal Component
interface ExportModalProps {
  onClose: () => void;
  onExport: (format: "JSON" | "HTML") => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<"JSON" | "HTML" | null>(null);

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>
          {/* <FaTimes /> */}
        </CloseButton>
        <Title>Export</Title>
        <Subtitle>Select the format before exporting:</Subtitle>

        <OptionsContainer>
          <Option selected={selectedFormat === "JSON"}>
            <img src="/json-icon.png" alt="JSON" />
            <input
              type="radio"
              name="exportFormat"
              value="JSON"
              onChange={() => setSelectedFormat("JSON")}
            />
            JSON
          </Option>

          <Option selected={selectedFormat === "HTML"}>
            <img src="/html-icon.png" alt="HTML" />
            <input
              type="radio"
              name="exportFormat"
              value="HTML"
              onChange={() => setSelectedFormat("HTML")}
            />
            HTML
          </Option>
        </OptionsContainer>

        <ButtonContainer>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary disabled={!selectedFormat} onClick={() => selectedFormat && onExport(selectedFormat)}>
            Export
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default ExportModal;
