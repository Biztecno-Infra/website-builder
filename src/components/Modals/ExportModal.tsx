import React, { useState } from "react";
import styled from "styled-components";
import ModalOverlay from "@components/lib/ModalOverlay";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { ExportType, SizeEnum } from "enum";

const Title = styled.div`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
`;

const Subtitle = styled.div`
  font-size: 0.68rem;
  margin-bottom: 20px;
  text-align: left;
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
`;

const Option = styled.label<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  width: 50%;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => (props.selected ? "#007f7f" : "black")};
  margin: 1rem;

  input {
    color: ${(props) => (props.selected ? "#007f7f" : "black")};
  }
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
  background: ${(props) => (props.primary ? "#008080" : "#ddd")};
  color: ${(props) => (props.primary ? "white" : "black")};

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

interface ExportModalProps {
  onClose: () => void;
  onExport: (format: ExportType) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportType | null>(null);

  const handleExportFormat = () => {
    if(selectedFormat) {
      onExport(selectedFormat)
      onClose()
    }
  }

  return (
    <ModalOverlay onClose={onClose} isSmall>
      <Title>Export</Title>
      <Subtitle>Select the format before exporting:</Subtitle>

      <OptionsContainer>
        <Option selected={selectedFormat === "JSON"}>
          <SvgIcon name={CUSTOM_SVG_ICON.JsonFile} size={SizeEnum.Medium} />
          <input
            type="radio"
            name="exportFormat"
            value="JSON"
            onChange={() => setSelectedFormat(ExportType.JSON)}
            checked={selectedFormat === "JSON"}
          />
        </Option>

        <Option selected={selectedFormat === "HTML"}>
          <SvgIcon name={CUSTOM_SVG_ICON.HtmlFile} size={SizeEnum.Medium} />
          <input
            type="radio"
            name="exportFormat"
            value="HTML"
            onChange={() => setSelectedFormat(ExportType.HTML)}
            checked={selectedFormat === "HTML"}
          />
        </Option>
      </OptionsContainer>

      <ButtonContainer>
        <Button onClick={onClose}>Cancel</Button>
        <Button primary disabled={!selectedFormat} onClick={handleExportFormat}>
          Export
        </Button>
      </ButtonContainer>
    </ModalOverlay>
  );
};

export default ExportModal;
