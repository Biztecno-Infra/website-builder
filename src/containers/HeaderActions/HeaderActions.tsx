import React, { useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "@components/lib";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal from "@components/Modals/ExportModal";
import SendTestModal from "@components/Modals/SendFileModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockHook } from "@context/BlockContext";
import { ExportType , ScreenViews } from "enum";

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

function HeaderActions() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { selectedView, setSelectedView , handleJsonUpload , blocksToJson , convertJsonToHtml } = useBlockHook();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleClose = () => {
    setSelectedOption(null);
  };

  const handleViewChange = (view: ScreenViews) => {
    setSelectedView(view);
  };

  const handleExport = (format: ExportType) => {
    const convertedJson = blocksToJson();
    if (format === ExportType.JSON) {
      console.log(convertedJson, "convertedJson");
    } else if (format === ExportType.HTML) {
      const convertedHtml = convertJsonToHtml(convertedJson);
      console.log(convertedHtml , "convertedHtml");
    }
  };

  return (
    <StyledHeader>
      <LeftActions>
        <SvgIcon
          name={CUSTOM_SVG_ICON.DesktopIcon}
          onClick={() => handleViewChange(ScreenViews.DESKTOP)}
          svgStyle={{ cursor: "pointer", marginRight: "10px", padding: '0.5rem', borderRadius: "5px" }}
          bgColor={selectedView === ScreenViews.DESKTOP ? "#CCE2E3" : ""}
        />
        <SvgIcon
          name={CUSTOM_SVG_ICON.MobileIcon}
          onClick={() => handleViewChange(ScreenViews.MOBILE)}
          svgStyle={{ cursor: "pointer", padding: '0.5rem', borderRadius: "5px" }}
          bgColor={selectedView === ScreenViews.MOBILE ? "#CCE2E3" : ""}
        />
      </LeftActions>
      <RightActions>
        <ButtonComponent $buttonPrimary text="Send" />
        <CustomDropdownButton
          options={["Export", "Upload", "Send Test"]}
          onSelect={handleOptionSelect}
          buttonText="Actions"
        />
      </RightActions>
      {selectedOption === "Export" && (
        <ExportModal onClose={handleClose} onExport={handleExport} />
      )}
      {selectedOption === "Upload" && (
        <UploadModal onClose={handleClose} onUpload={(json) => {handleJsonUpload(json)}} />
      )}
      {selectedOption === "Send Test" && (
        <SendTestModal onClose={handleClose} onSend={(file) => { }} />
      )}
    </StyledHeader>
  );
}

export default HeaderActions;