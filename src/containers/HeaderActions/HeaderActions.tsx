import React, { useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "@components/lib";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal from "@components/Modals/ExportModal";
import SendTestModal from "@components/Modals/SendFileModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockHook } from "@context/BlockContext";
import { ScreenViews } from "enum";
import { convertJsonToHtml } from "email-builder-utils";
import ImportTemplateModal from "@components/Modals/ImportTemplateModal";

const StyledHeader = styled.div`
  width: 100%;
  height: 3rem;
  display: flex;
  align-items: center;
  border: 1px solid #dddddd;
  border-top: none;
`;

const LeftActions = styled.div`
  display: flex;
  width: 70%;
  justify-content: center;
`;

const RightActions = styled.div`
  display: flex;
  width: 30%;
  justify-content: flex-end;
`;
interface Props {
  onExport: (format: 'JSON' | 'HTML', data: any) => void;
}

function HeaderActions({ onExport }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [open, setopen] = useState(false)
  const {
    selectedView,
    setSelectedView,
    handleJsonUpload,
    blocksToJson
  } = useBlockHook();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleTemplateModal = () => {
    setopen(true)
  }

  const handleClose = () => {
    setSelectedOption(null);
  };

  const handleViewChange = (view: ScreenViews) => {
    setSelectedView(view);
  };

  const handleExport = async (format: 'JSON' | 'HTML') => {
    const convertedData = format === 'JSON' ? blocksToJson() : await convertJsonToHtml(blocksToJson());
    if (typeof onExport === "function") {
      onExport(format, convertedData);
    }
  };


  return (
    <StyledHeader>
      <LeftActions>
        <SvgIcon
          name={CUSTOM_SVG_ICON.DesktopIcon}
          onClick={() => handleViewChange(ScreenViews.DESKTOP)}
          svgStyle={{
            cursor: "pointer",
            marginRight: "10px",
            padding: "0.5rem",
            borderRadius: "5px",
          }}
          bgColor={selectedView === ScreenViews.DESKTOP ? "#CCE2E3" : ""}
        />
        <SvgIcon
          name={CUSTOM_SVG_ICON.MobileIcon}
          onClick={() => handleViewChange(ScreenViews.MOBILE)}
          svgStyle={{
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "5px",
          }}
          bgColor={selectedView === ScreenViews.MOBILE ? "#CCE2E3" : ""}
        />
      </LeftActions>
      <RightActions>
        {/* <ButtonComponent $buttonPrimary text="Import Template" handleClick={handleTemplateModal} />
        {open && (
          <ImportTemplateModal onClose={handleClose} />
        )} */}
        <CustomDropdownButton
          options={["Export", "Import"]}
          onSelect={handleOptionSelect}
          buttonText="Actions"
        />
      </RightActions>
      {selectedOption === "Export" && (
        <ExportModal onClose={handleClose} onExport={handleExport} />
      )}
      {selectedOption === "Import" && (
        <ImportTemplateModal onClose={handleClose} />
      )}
      {selectedOption === "Upload" && (
        <UploadModal
          onClose={handleClose}
          onUpload={(json) => {
            handleJsonUpload(json);
          }}
        />
      )}
      {selectedOption === "Send Test" && (
        <SendTestModal onClose={handleClose} onSend={(file) => { }} />
      )}
    </StyledHeader>
  );
}

export default HeaderActions;
