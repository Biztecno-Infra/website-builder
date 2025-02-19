import { forwardRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

import PropertyPanel from "@containers/PropertyPanel";
import ElementsPanel from "@containers/ElementsPanel";
import { BlockHookProvider } from "./context/BlockContext";
import { BlockHookRef, Theme } from "./types";
import CustomThemeProvider from "@context/ThemeContext";
import { ButtonComponent } from "@components/lib";
import CanvasContainer from "@containers/CanvasContainer";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal from "@components/Modals/ExportModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SendTestModal from "@components/Modals/SendFileModal";

interface Props {
  theme?: Theme;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 16.8rem);
  height: 100%;
`;

const Header = styled.div`
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border: 1px solid #dddddd;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 4rem);
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(
  ({ theme }, ref) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleOptionSelect = (option: string) => {
      setSelectedOption(option);
    };

    const handleClose = () => {
      setSelectedOption(null);
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container>
              <ElementsPanel />
              <MiddleContainer>
                <Header>
                  <ButtonComponent primary text="Send" />
                  <CustomDropdownButton
                    options={["Export", "Upload", "Send Test"]}
                    onSelect={handleOptionSelect}
                    buttonText="Actions"
                  />
                </Header>

                <ContentWrapper>
                  <CanvasContainer />
                  <PropertyPanel />
                </ContentWrapper>
              </MiddleContainer>
            </Container>

            {selectedOption === "Export" && (
              <ExportModal onClose={handleClose} onExport={() => { }} />
            )}
            {selectedOption === "Upload" && (
              <UploadModal onClose={handleClose} onUpload={() => { }} />
            )}
            {selectedOption === "Send Test" && (
              <SendTestModal onClose={handleClose} onSend={(file) => { }} />
            )}
          </BlockHookProvider>
        </CustomThemeProvider>
      </DndProvider>
    );
  }
);


export default EmailTemplateBuilder;
