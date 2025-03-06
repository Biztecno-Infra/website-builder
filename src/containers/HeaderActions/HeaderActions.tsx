import React, { useState } from "react";
import styled from "styled-components";
import { ButtonComponent } from "@components/lib";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal from "@components/Modals/ExportModal";
import SendTestModal from "@components/Modals/SendFileModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockHook } from "@context/BlockContext";
import { ScreenViews } from "@utils/constant";

const Header = styled.div`
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border: 1px solid #dddddd;
  border-top: none;
`;

function HeaderActions() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { setSelectedView } = useBlockHook();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleClose = () => {
    setSelectedOption(null);
  };

  const handleViewChange = (view: ScreenViews) => {
    setSelectedView(view);
  };
  return (
    <Header>
      <div style={{ display: "flex" }}>
        <SvgIcon
          name={CUSTOM_SVG_ICON.DesktopIcon}
          onClick={() => handleViewChange(ScreenViews.DESKTOP)}
          svgStyle={{ cursor: "pointer", marginRight: "10px" }}
        />
        <SvgIcon
          name={CUSTOM_SVG_ICON.MobileIcon}
          onClick={() => handleViewChange(ScreenViews.MOBILE)}
          svgStyle={{ cursor: "pointer" }}
        />
      </div>
      <ButtonComponent buttonPrimary text="Send" />
      <CustomDropdownButton
        options={["Export", "Upload", "Send Test"]}
        onSelect={handleOptionSelect}
        buttonText="Actions"
      />

      {selectedOption === "Export" && (
        <ExportModal onClose={handleClose} onExport={() => {}} />
      )}
      {selectedOption === "Upload" && (
        <UploadModal onClose={handleClose} onUpload={() => {}} />
      )}
      {selectedOption === "Send Test" && (
        <SendTestModal onClose={handleClose} onSend={(file) => {}} />
      )}
    </Header>
  );
}

export default HeaderActions;
