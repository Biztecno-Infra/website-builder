import { forwardRef, useEffect, useState } from "react";
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
import useClickOutside from "@hoc/useClickOutside";
import CustomDropdownButton from "@components/lib/ButtonWithDropdown";
import ExportModal from "@components/Modals/ExportModal";
import UploadModal from "@components/Modals/UploadJsonModal";
import SendTestModal from "@components/Modals/SendFileModal";

interface Props {
  theme?: Theme;
}
// Styled Components
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 20rem);
  height: 100%;
`;

const Header = styled.div`
  width: 100%;
  height: 4rem;
  display: flex;
  justify-content: flex-end;
  border: 1px solid #dddddd;
  padding-right: 10px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 4rem);
`;

// Modal Overlay Styles
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
`;

const EmailTemplateBuilder = forwardRef<BlockHookRef, Props>(
  ({ theme }, ref) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    return (
      <DndProvider backend={HTML5Backend}>
        <CustomThemeProvider theme={theme! || {}}>
          <BlockHookProvider ref={ref}>
            <Container>
              <ElementsPanel />
              <MiddleContainer>
                <Header>
                  <ButtonComponent primary text="Send" />
                  {/* <button onClick={() => setSelectedOption("Export")}>Test Export</button> */}

                  <CustomDropdownButton
                    options={["Export", "Upload", "Send Test"]}
                    onSelect={(option) => {
                      console.log("Selected Option:", option);
                      setSelectedOption(option);
                    }}
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
              <SendTestModal
                onClose={() => {}}
                onSend={(file) => {
                  console.log(file);
                }}
              />
            )}
          </BlockHookProvider>
        </CustomThemeProvider>
      </DndProvider>
    );
  }
);

export default EmailTemplateBuilder;
