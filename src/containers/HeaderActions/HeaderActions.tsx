import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { ButtonComponent } from "@components/lib";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal, { OutputFormat } from "@components/Modals/ExportModal";
import SendTestModal from "@components/Modals/SendFileModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SvgIcon, { CUSTOM_SVG_ICON } from "@components/SvgIcon";
import { useBlockHook } from "@context/BlockContext";
import { ScreenViews } from "enum";
import { convertJsonToHtml } from "email-builder-utils";
import ImportTemplateModal from "@components/Modals/ImportTemplateModal";
import PerviewTemplateModal from "@components/Modals/PerviewTemplateModal";
// import { convertJsonToHtml } from "@utils/jsonToHtml";

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
  width: calc(100% - 20.4rem);
  justify-content: center;
`;

const RightActions = styled.div`
  display: flex;
  width: 20.4rem;
  justify-content: space-evenly;
  align-items: center;
`;
interface Props {
  onExport: (format: OutputFormat, data: any) => void;
  onImport: () => void;
}

function HeaderActions({ onExport, onImport }: Props) {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    imageSrc: string;
    title: string;
    author: string;
  } | null>(null);

  const {
    selectedView,
    setSelectedView,
    handleJsonUpload,
    blocksToJson,
    handleImportTemplates,
    undo,
    redo,
    canRedo,
    canUndo,
  } = useBlockHook();

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handlePreview = (template: {
    imageSrc: string;
    title: string;
    author: string;
  }) => {
    setSelectedTemplate(template);
    setPreviewTemplate(true);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(false);
    setSelectedTemplate(null);
    // setSelectedOption(null)
  };

  const handleClose = () => {
    setSelectedOption(null);
  };

  const handleViewChange = (view: ScreenViews) => {
    setSelectedView(view);
  };

  const handleExport = async (format: OutputFormat) => {
    const convertedData =
      format === "JSON"
        ? blocksToJson()
        : await convertJsonToHtml(blocksToJson());
    if (typeof onExport === "function") {
      console.log("Exporting data:", convertedData);
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
            color:
              selectedView === ScreenViews.DESKTOP
                ? theme.colors.primary
                : "#8A8A8A",
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
            color:
              selectedView === ScreenViews.MOBILE
                ? theme.colors.primary
                : "#8A8A8A",
          }}
          bgColor={selectedView === ScreenViews.MOBILE ? "#CCE2E3" : ""}
        />
      </LeftActions>
      <RightActions>
        {/* {canUndo && <ButtonComponent
          $buttonPrimary
          handleClick={undo}
          text="Undo"
        />}
       {canRedo &&  <ButtonComponent
          $buttonPrimary
          handleClick={redo}
          text="Redo"
        />} */}

        <ButtonComponent
          $buttonPrimary
          handleClick={() => setSelectedOption("Export")}
          text="Export"
        />
        <ButtonComponent $buttonPrimary handleClick={onImport} text="Import" />
        {/* <ButtonComponent
          $buttonPrimary
          handleClick={() => setSelectedOption("Upload")}
          text="Upload"
        /> */}

        {/* <CustomDropdownButton
          options={["Export","Upload"]}
          onSelect={handleOptionSelect}
          buttonText="Actions"
        /> */}
      </RightActions>
      {selectedOption === "Export" && (
        <ExportModal onClose={handleClose} onExport={handleExport} />
      )}
      {/* {selectedOption === "Import" && (
        <ImportTemplateModal onClose={handleClose} templates={templates} onImport={handleImportTemplates}/>
      )} */}
      {previewTemplate && selectedTemplate && (
        <PerviewTemplateModal
          onClose={handleClosePreview}
          template={selectedTemplate}
        />
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
        <SendTestModal onClose={handleClose} onSend={(file) => {}} />
      )}
    </StyledHeader>
  );
}

export default HeaderActions;
